import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { Comment } from '../models/Comment';
import { Solution } from '../models/Solution';
import { Task } from '../models/Task';

const router = Router();

/**
 * @openapi
 * /tasks/{taskId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Получить комментарии к задаче
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [COMMENT, SOLUTION] }
 *     responses:
 *       200: { description: Список комментариев }
 */
router.get('/tasks/:taskId/comments', async (req, res) => {
  const { taskId } = req.params;
  const { type } = req.query;

  const filter: any = { taskId, isPublic: true, parentId: null }; // только корневые
  if (type) filter.type = type;

  const comments = await Comment.find(filter)
    .populate('userId', 'username')
    .populate({
      path: 'replies',
      match: { isPublic: true },
      options: { sort: { createdAt: 1 } },
      populate: { path: 'userId', select: 'username' }
    })
    .sort({ createdAt: -1 });

  res.json(comments);
});

/**
 * @openapi
 * /tasks/{taskId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Оставить комментарий или ответ
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
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *               parentId: { type: string, description: 'ID родительского комментария для ответа' }
 *     responses:
 *       201: { description: Комментарий создан }
 */
router.post('/tasks/:taskId/comments', authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { content, parentId } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  // Если это ответ, проверяем существование родителя
  if (parentId) {
    const parent = await Comment.findById(parentId);
    if (!parent) return res.status(404).json({ error: 'Parent comment not found' });
  }

  const comment = new Comment({
    taskId,
    userId: (req as any).user.userId,
    type: 'COMMENT',
    content,
    parentId: parentId || null,
  });
  await comment.save();

  const populated = await Comment.findById(comment._id)
    .populate('userId', 'username');
    
  res.status(201).json(populated);
});

/**
 * @openapi
 * /tasks/{taskId}/solutions:
 *   post:
 *     tags: [Comments]
 *     summary: Опубликовать решение задачи
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
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201: { description: Решение опубликовано }
 *       400: { description: Нельзя опубликовать решение }
 */
router.post('/tasks/:taskId/solutions', authenticate, async (req, res) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = (req as any).user.userId;

  const successSolution = await Solution.findOne({ userId, taskId, status: 'COMPLETED' });
  if (!successSolution) return res.status(400).json({ error: 'You must solve the task first' });

  const existing = await Comment.findOne({ taskId, userId, type: 'SOLUTION' });
  if (existing) return res.status(400).json({ error: 'You have already published a solution' });

  const comment = new Comment({
    taskId,
    userId,
    type: 'SOLUTION',
    content,
    code: successSolution.code,
  });
  await comment.save();

  const populated = await Comment.findById(comment._id)
    .populate('userId', 'username');
    
  res.status(201).json(populated);
});

/**
 * @openapi
 * /comments/{id}/like:
 *   post:
 *     tags: [Comments]
 *     summary: Лайкнуть/анлайкнуть комментарий
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Состояние лайка }
 */
router.post('/comments/:id/like', authenticate, async (req, res) => {
  const userId = (req as any).user.userId;
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });

  const likeIndex = comment.likes.findIndex(id => id.toString() === userId);
  if (likeIndex > -1) {
    comment.likes.splice(likeIndex, 1);
  } else {
    comment.likes.push(userId as any);
  }
  await comment.save();
  
  res.json({ 
    likes: comment.likes.length, 
    liked: likeIndex === -1 
  });
});

/**
 * @openapi
 * /comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: Удалить комментарий (автор или админ)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Комментарий удалён }
 *       403: { description: Не автор }
 */
router.delete('/comments/:id', authenticate, async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  
  const isAuthor = comment.userId.toString() === (req as any).user.userId;
  const isAdmin = (req as any).user.role === 'admin';
  
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized to delete this comment' });
  }
  
  // Удаляем сам комментарий и все ответы на него
  await Comment.deleteMany({ $or: [{ _id: comment._id }, { parentId: comment._id }] });
  
  res.status(204).end();
});

export default router;