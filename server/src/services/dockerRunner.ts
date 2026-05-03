import Docker from 'dockerode';

const docker = new Docker();

export async function runTestsInContainer(
  userCode: string,
  testCode: string,
  htmlContent: string
): Promise<{ total: number; passed: number; output: string; errorLog: string; executionTimeMs: number }> {
  const container = await docker.createContainer({
    Image: process.env.DOCKER_IMAGE || 'qa-runner:latest',
    Env: [
      `USER_CODE=${Buffer.from(userCode).toString('base64')}`,
      `TEST_CODE=${Buffer.from(testCode).toString('base64')}`,
      `HTML_CONTENT=${Buffer.from(htmlContent).toString('base64')}`,
    ],
    HostConfig: {
      Memory: 256 * 1024 * 1024, // 256 MB
      CpuShares: 512,
      NetworkMode: 'none',
      AutoRemove: true,
    },
  });

  await container.start();
  const stream = await container.logs({ stdout: true, stderr: true, follow: true });

  let output = '';
  let errorLog = '';
  stream.on('data', (chunk: Buffer) => {
    // лог multiplexed: первые 8 байт – заголовок
    const header = chunk.readUInt8(0);
    const data = chunk.slice(8).toString();
    if (header === 1) output += data;
    else errorLog += data;
  });

  const timeout = setTimeout(async () => {
    await container.stop({ t: 0 }).catch(() => {});
    throw new Error('TIMEOUT');
  }, 30000); // 30 сек

  await container.wait();
  clearTimeout(timeout);

  // Результат ожидается в stdout как JSON
  let parsed;
  try {
    parsed = JSON.parse(output.trim());
  } catch {
    parsed = { numTotalTests: 0, numPassedTests: 0, message: output, error: errorLog, time: 0 };
  }
  return {
    total: parsed.numTotalTests || 0,
    passed: parsed.numPassedTests || 0,
    output: parsed.message || '',
    errorLog: parsed.error || '',
    executionTimeMs: parsed.time || 0,
  };
}