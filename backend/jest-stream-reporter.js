/* eslint-disable */
// Custom Jest reporter that emits one NDJSON line per test event so the
// backend SSE endpoint can forward them to the browser in real time.
// Every output line is prefixed with [STREAM] so other Jest output can be
// filtered out by the parser.
const path = require('path');

const PREFIX = '[STREAM]';

function emit(event) {
  try {
    process.stdout.write(PREFIX + JSON.stringify(event) + '\n');
  } catch (err) {
    // ignore write errors — they usually mean the client disconnected
  }
}

class StreamReporter {
  onRunStart(results) {
    emit({
      type: 'runStart',
      numTotalTestSuites: results.numTotalTestSuites,
      timestamp: Date.now(),
    });
  }

  onTestFileStart(test) {
    emit({
      type: 'suiteStart',
      suiteName: path.basename(test.path),
      timestamp: Date.now(),
    });
  }

  onTestCaseResult(test, testCaseResult) {
    emit({
      type: 'testCase',
      suiteName: path.basename(test.path),
      name: testCaseResult.fullName || testCaseResult.title,
      title: testCaseResult.title,
      status: testCaseResult.status,
      duration: testCaseResult.duration || 0,
      failureMessages: testCaseResult.failureMessages || [],
      timestamp: Date.now(),
    });
  }

  onTestFileResult(test, testResult) {
    emit({
      type: 'suiteResult',
      suiteName: path.basename(test.path),
      status: testResult.numFailingTests === 0 ? 'passed' : 'failed',
      numPassing: testResult.numPassingTests,
      numFailing: testResult.numFailingTests,
      duration: testResult.perfStats.end - testResult.perfStats.start,
      timestamp: Date.now(),
    });
  }

  onRunComplete(contexts, results) {
    emit({
      type: 'runComplete',
      success: results.success,
      numTotalTests: results.numTotalTests,
      numPassedTests: results.numPassedTests,
      numFailedTests: results.numFailedTests,
      numTotalTestSuites: results.numTotalTestSuites,
      numPassedTestSuites: results.numPassedTestSuites,
      numFailedTestSuites: results.numFailedTestSuites,
      timestamp: Date.now(),
    });
  }
}

module.exports = StreamReporter;
