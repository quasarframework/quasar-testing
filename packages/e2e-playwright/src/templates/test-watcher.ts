/**
 * Playwright does not yet offer a means to run the tests in a watch mode.
 */

import  { type ChildProcess, spawn } from 'child_process';
import chokidar from 'chokidar';

let testProcess: ChildProcess | undefined;
let isExiting = false;
let initialRunComplete = false;

function runTests() {
  if (!testProcess) {
    startNewProcess();
    return
  } 

  console.log('Restarting Playwright UI...');
  testProcess.kill('SIGTERM');

  const timeout = setTimeout(() => {
    if (testProcess) {
      console.log('Forcefully killing Playwright UI...');
      testProcess.kill('SIGKILL');
    }
  }, 2000);

  testProcess.on('exit', () => {
    clearTimeout(timeout);
    if (isExiting) {
      return;
    }

    startNewProcess();
  });
}

function startNewProcess() {
  testProcess = spawn('pnpm', ['exec', 'playwright', 'test', '--ui'], { stdio: 'inherit' });

  testProcess.on('close', (code) => {
    if (!code && !isExiting) {
      console.error(`Playwright tests exited with code ${code}`);
    }
    testProcess = undefined;

    if (isExiting) {
      process.exit(0);
    }
  });
}

const watcher = chokidar.watch('tests/**/*.{spec,test}.{js,ts}', { ignoreInitial: true });

watcher.on('all', (event, path) => {
  if (initialRunComplete && (event === "change" || event === "add" || event === "unlink")) {
    console.log(`File ${path} ${event}d, restarting tests...`);
    runTests();
  }
});

watcher.on('ready', () => {
  console.log('Initial scan complete.');
  initialRunComplete = true;
  runTests();
  console.log('Watching for changes...');
});

console.log('Starting watcher...');

process.on('SIGINT', () => {
  console.log('Exiting...');
  isExiting = true;

  if (!testProcess) {
    process.exit(0);
  } 
  
  testProcess.on('close', () => {
      process.exit(0)
  })
  testProcess.kill('SIGTERM');

  setTimeout(() => {
    if (testProcess) {
      testProcess.kill('SIGKILL');
    }
  }, 2000);
});