import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { UserStats } from '../models/UserStats';
import { sendVerificationEmail } from '../services/emailService';
import { authenticate } from '../middlewares/auth';
const router = Router();

function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET || 'access-secret', { expiresIn: '15m' });
}

function generateRefreshToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' });
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация нового пользователя с подтверждением email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201: { description: Пользователь создан, письмо отправлено }
 *       400: { description: Ошибка валидации }
 */
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(400).json({ error: 'Username or email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = new User({
    username,
    email,
    passwordHash,
    emailVerified: false,
    emailVerificationToken: verificationToken,
  });
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString(), user.role);
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    message: 'Registered successfully. Check your email for verification link.',
    accessToken,
    refreshToken,
    user: { id: user._id, username: user.username, role: user.role },
  });
});
/**
 * @openapi
 * /auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Подтверждение email по токену
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Email подтверждён }
 *       400: { description: Невалидный токен }
 */
router.get('/verify-email', async (req, res) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully. You can now login.' });
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход и получение токенов
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Access и refresh токены }
 *       401: { description: Неверные учетные данные }
 *       403: { description: Email не подтверждён }
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.emailVerified)
    return res.status(403).json({ error: 'Email not verified. Check your inbox.' });

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString(), user.role);
  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    accessToken,
    refreshToken,
    user: { id: user._id, username: user.username, role: user.role },
  });
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Обновить access-токен по refresh-токену
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Новый access-токен }
 *       403: { description: Невалидный refresh-токен }
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }
    const accessToken = generateAccessToken(user._id.toString(), user.role);
    res.json({ accessToken });
  } catch {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Выход (удаление refresh-токена)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Успешный выход }
 */
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    try {
      const payload = jwt.decode(refreshToken) as any;
      await User.findByIdAndUpdate(payload.userId, { $unset: { refreshToken: 1 } });
    } catch {}
  }
  res.json({ message: 'Logged out' });
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Profile]
 *     summary: Получить профиль текущего пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Данные профиля }
 */
router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById((req as any).user.userId).select('-passwordHash -refreshToken -emailVerificationToken');
  if (!user) return res.status(404).json({ error: 'User not found' });
  const stats = await UserStats.findOne({ userId: user._id });
  res.json({ user, stats });
});

/**
 * @openapi
 * /auth/me:
 *   put:
 *     tags: [Profile]
 *     summary: Обновить имя пользователя
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *     responses:
 *       200: { description: Имя обновлено }
 *       400: { description: Имя занято }
 */
router.put('/me', authenticate, async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const existing = await User.findOne({ username, _id: { $ne: (req as any).user.userId } });
  if (existing) return res.status(400).json({ error: 'Username already taken' });
  const user = await User.findByIdAndUpdate(
    (req as any).user.userId,
    { username },
    { new: true }
  ).select('-passwordHash -refreshToken -emailVerificationToken');
  res.json(user);
});

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     tags: [Profile]
 *     summary: Изменить пароль
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Пароль изменён }
 *       400: { description: Старый пароль неверен }
 */
router.post('/change-password', authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

  const user = await User.findById((req as any).user.userId);
  if (!user || !(await user.comparePassword(oldPassword)))
    return res.status(400).json({ error: 'Incorrect current password' });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.refreshToken = undefined; // сброс refresh-токена для безопасности
  await user.save();

  res.json({ message: 'Password changed. Please login again.' });
});

/**
 * @openapi
 * /auth/stats:
 *   get:
 *     tags: [Profile]
 *     summary: Получить статистику пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Статистика }
 */
router.get('/stats', authenticate, async (req, res) => {
  let stats = await UserStats.findOne({ userId: (req as any).user.userId });
  if (!stats) {
    stats = new UserStats({ userId: (req as any).user.userId });
    await stats.save();
  }
  res.json(stats);
});

/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     tags: [Auth]
 *     summary: Повторно отправить письмо для подтверждения email
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Письмо отправлено }
 *       400: { description: Email уже подтверждён }
 */
router.post('/resend-verification', authenticate, async (req, res) => {
  const user = await User.findById((req as any).user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = verificationToken;
  await user.save();

  await sendVerificationEmail(user.email, verificationToken);
  res.json({ message: 'Verification email resent' });
});


export default router;