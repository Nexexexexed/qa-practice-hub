import { Router } from 'express';
import { Task } from '../models/Task';
import { authenticate, adminOnly } from '../middlewares/auth';

const router = Router();

/**
 * @openapi
 * /tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: Получить список задач (с фильтрацией)
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *     responses:
 *       200: { description: Массив задач }
 */
router.get('/', async (req, res) => {
  const { difficulty, tag } = req.query;
  const filter: any = {};
  if (difficulty) filter.difficulty = difficulty;
  if (tag) filter.tags = tag;
  const tasks = await Task.find(filter).select('-testCode');
  res.json(tasks);
});

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Получить задачу по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Детали задачи }
 */
router.get('/:id', async (req, res) => {
  const task = await Task.findById(req.params.id).select('-testCode');
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

/**
 * @openapi
 * /tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Создать новую задачу (администратор)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, difficulty, htmlContent, testCode]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               difficulty: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *               htmlContent: { type: string }
 *               starterCode: { type: string }
 *               testCode: { type: string }
 *     responses:
 *       201: { description: Задача создана }
 */
router.post('/', authenticate, adminOnly, async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
});

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     tags: [Tasks]
 *     summary: Обновить задачу (администратор)
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
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               difficulty: { type: string, enum: [BEGINNER, INTERMEDIATE, ADVANCED] }
 *               htmlContent: { type: string }
 *               starterCode: { type: string }
 *               testCode: { type: string }
 *     responses:
 *       200: { description: Задача обновлена }
 */
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Удалить задачу (администратор)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Задача удалена }
 */
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;