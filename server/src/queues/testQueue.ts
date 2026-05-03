import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { runTestsInContainer } from '../services/dockerRunner';
import { Solution } from '../models/Solution';
import { updateUserStats } from '../services/statsService';

const connection = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: 6379, maxRetriesPerRequest: null });

export const testQueue = new Queue('test-execution', { connection });

const worker = new Worker('test-execution', async (job: Job) => {
  const { solutionId } = job.data;
  const solution = await Solution.findById(solutionId).populate('taskId');
  if (!solution) throw new Error('Solution not found');

  const task = solution.taskId as any;
  try {
    const result = await runTestsInContainer(solution.code, task.testCode, task.htmlContent);
    const passed = result.passed === result.total;
    await Solution.findByIdAndUpdate(solutionId, {
      status: passed ? 'COMPLETED' : 'FAILED',
      result: {
        totalTests: result.total,
        passedTests: result.passed,
        output: result.output,
        errorLog: result.errorLog,
        executionTimeMs: result.executionTimeMs,
      },
    });

    if (passed) {
      await updateUserStats(solution.userId.toString(), task._id.toString());
    }
  } catch (error: any) {
    const status = error.message === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR';
    await Solution.findByIdAndUpdate(solutionId, {
      status,
      result: { totalTests: 0, passedTests: 0, output: error.message, errorLog: error.stack, executionTimeMs: 0 },
    });
  }
}, { connection, concurrency: 3 });