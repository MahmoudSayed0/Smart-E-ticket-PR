import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { spawn } from 'child_process';
import * as path from 'path';

const STREAM_PREFIX = '[STREAM]';

@ApiTags('tests')
@Controller('tests')
export class TestController {
  @Get('stream')
  @ApiOperation({
    summary:
      'Streams Jest test results via Server-Sent Events as each test completes',
  })
  streamTests(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const sendEvent = (data: unknown) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const reporterPath = path.join(process.cwd(), 'jest-stream-reporter.js');
    const jest = spawn(
      'npx',
      [
        'jest',
        '--reporters',
        reporterPath,
        '--runInBand',
        '--silent',
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, FORCE_COLOR: '0' },
      },
    );

    let stdoutBuffer = '';

    jest.stdout.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split('\n');
      stdoutBuffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith(STREAM_PREFIX)) continue;
        const json = trimmed.slice(STREAM_PREFIX.length);
        try {
          const event = JSON.parse(json);
          sendEvent(event);
        } catch {
          // malformed line, skip
        }
      }
    });

    let stderrData = '';
    jest.stderr.on('data', (chunk: Buffer) => {
      stderrData += chunk.toString();
      // Jest writes informational output to stderr — we silently accept it.
    });

    jest.on('close', (code) => {
      sendEvent({ type: 'done', exitCode: code, stderr: stderrData.slice(-500) });
      res.end();
    });

    jest.on('error', (err) => {
      sendEvent({ type: 'error', message: err.message });
      res.end();
    });

    res.on('close', () => {
      if (!jest.killed) {
        jest.kill('SIGTERM');
      }
    });
  }
}
