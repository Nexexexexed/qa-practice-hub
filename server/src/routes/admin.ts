import { Router } from 'express';
import { authenticate, adminOnly } from '../middlewares/auth';
import { User } from '../models/User';
import { Task } from '../models/Task';

const router = Router();

// Все роуты защищены authenticate + adminOnly

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Получить список пользователей (админ)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Список пользователей }
 */
router.get('/users', authenticate, adminOnly, async (req, res) => {
  const users = await User.find().select('-passwordHash -refreshToken -emailVerificationToken');
  res.json(users);
});

/**
 * @openapi
 * /admin/users/{id}/role:
 *   put:
 *     tags: [Admin]
 *     summary: Изменить роль пользователя (админ)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200: { description: Роль обновлена }
 */
router.put('/users/:id/role', authenticate, adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
    .select('-passwordHash -refreshToken -emailVerificationToken');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

/**
 * @openapi
 * /admin/users/{id}/toggle-active:
 *   put:
 *     tags: [Admin]
 *     summary: Заблокировать/разблокировать пользователя (админ)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Статус изменён }
 */
router.put('/users/:id/toggle-active', authenticate, adminOnly, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  user.isActive = !user.isActive;
  await user.save();
  
  res.json({ _id: user._id, isActive: user.isActive });
});

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Удалить пользователя (админ)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Пользователь удалён }
 */
router.delete('/users/:id', authenticate, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;