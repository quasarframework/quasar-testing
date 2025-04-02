import { spawn } from 'child_process';
import chokidar from 'chokidar';

let testProcess;
let isExiting = false;
let initialRunComplete = false;

function runTests() {
  if (testProcess) {
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
      if (!isExiting) {
        startNewProcess();
      }
    });
  } else {
    startNewProcess();
  }
}

function startNewProcess() {
  testProcess = spawn('pnpm', ['exec', 'playwright', 'test', '--ui'], { stdio: 'inherit' });

  testProcess.on('close', (code) => {
    if (code !== 0 && code !== null && !isExiting) {
      console.error(`Playwright tests exited with code ${code}`);
    }
    testProcess = null;

    // Exit if isExiting is true OR if the process exited on its own
    if (isExiting || !testProcess) {
      if (isExiting) {
        console.log("Exiting...")
      }
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

  if (testProcess) {
    testProcess.kill('SIGTERM');
    setTimeout(() => {
      if (testProcess) {
        testProcess.kill('SIGKILL');
      }
    }, 2000);
  } else {
    process.exit(0);
  }
});