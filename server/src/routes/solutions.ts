import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { Solution } from '../models/Solution';
import { Task } from '../models/Task';
import { testQueue } from '../queues/testQueue';

const router = Router();

/**
 * @openapi
 * /tasks/{taskId}/run:
 *   post:
 *     tags: [Solutions]
 *     summary: Запустить тест для задачи
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string, description: 'Код пользователя' }
 *     responses:
 *       202: { description: Решение принято в очередь }
 */
router.post('/tasks/:taskId/run', authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { code } = req.body;
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const solution = new Solution({
    userId: (req as any).user.userId,
    taskId,
    code,
    status: 'PENDING',
  });
  await solution.save();

  await testQueue.add('run-test', { solutionId: solution._id.toString() });
  res.status(202).json({ solutionId: solution._id });
});

/**
 * @openapi
 * /solutions/{id}:
 *   get:
 *     tags: [Solutions]
 *     summary: Получить статус и результат решения
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Статус и результат }
 */
router.get('/solutions/:id', authenticate, async (req, res) => {
  const solution = await Solution.findById(req.params.id).select('status result').lean();
  if (!solution) return res.status(404).json({ error: 'Solution not found' });
  res.json(solution);
});

export default router; 