#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkCommand(command) {
  return new Promise((resolve) => {
    exec(`which ${command}`, (error) => {
      resolve(!error);
    });
  });
}

async function checkSetup() {
  log('\n🔍 Checking setup...', colors.cyan);

  // Check Node modules
  if (!existsSync(join(__dirname, 'node_modules'))) {
    log('  ✗ Node modules not installed', colors.red);
    log('  Please run: npm run setup', colors.yellow);
    return false;
  }
  log('  ✓ Node modules installed', colors.green);

  // Check Python
  const hasPython = await checkCommand('python3') || await checkCommand('python');
  if (!hasPython) {
    log('  ✗ Python not found', colors.red);
    log('  Please install Python 3.8+', colors.yellow);
    return false;
  }
  log('  ✓ Python found', colors.green);

  return true;
}

function startBackend() {
  return new Promise((resolve, reject) => {
    log('\n🚀 Starting backend server...', colors.magenta);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const backend = spawn(pythonCmd, ['app.py'], {
      cwd: join(__dirname, 'backend'),
      stdio: 'inherit',
      shell: true
    });

    backend.on('error', (error) => {
      log(`\n✗ Backend failed to start: ${error.message}`, colors.red);
      reject(error);
    });

    backend.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`\n⚠ Backend exited with code ${code}`, colors.yellow);
      }
    });

    // Give backend time to start
    setTimeout(() => {
      log('  ✓ Backend server starting...', colors.green);
      resolve(backend);
    }, 2000);
  });
}

function startFrontend() {
  return new Promise((resolve, reject) => {
    log('\n🌐 Starting frontend server...', colors.blue);

    const frontend = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    frontend.on('error', (error) => {
      log(`\n✗ Frontend failed to start: ${error.message}`, colors.red);
      reject(error);
    });

    frontend.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`\n⚠ Frontend exited with code ${code}`, colors.yellow);
      }
    });

    setTimeout(() => {
      log('  ✓ Frontend server starting...', colors.green);
      resolve(frontend);
    }, 1000);
  });
}

async function autoInstallDependencies() {
  log('\n📦 Auto-checking dependencies...', colors.cyan);

  // Check if node_modules exists
  if (!existsSync(join(__dirname, 'node_modules'))) {
    log('  Installing Node.js dependencies...', colors.yellow);
    try {
      await execAsync('npm install');
      log('  ✓ Dependencies installed', colors.green);
    } catch (error) {
      log('  ✗ Failed to install dependencies', colors.red);
      return false;
    }
  }

  // Check Python packages
  try {
    const pythonCmd = await checkCommand('python3') ? 'python3' : 'python';
    const testScript = 'import fastapi, uvicorn, torch';
    await execAsync(`${pythonCmd} -c "${testScript}"`);
    log('  ✓ Python dependencies available', colors.green);
  } catch (error) {
    log('  Installing Python dependencies...', colors.yellow);
    try {
      const pipCmd = await checkCommand('pip3') ? 'pip3' : 'pip';
      const backendPath = join(__dirname, 'backend');
      await execAsync(`${pipCmd} install -r requirements.txt`, { cwd: backendPath });
      log('  ✓ Python dependencies installed', colors.green);
    } catch (installError) {
      log('  ⚠ Some Python packages may be missing', colors.yellow);
      log('  The application will try to start anyway...', colors.yellow);
    }
  }

  return true;
}

async function main() {
  log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     CRM Business Predictor - Local Development Server     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`, colors.bright + colors.cyan);

  // Auto-install dependencies
  await autoInstallDependencies();

  // Check setup
  if (!await checkSetup()) {
    log('\n✗ Setup check failed. Please run: npm run setup\n', colors.red);
    process.exit(1);
  }

  log('\n' + '═'.repeat(60), colors.cyan);
  log('Starting servers...', colors.bright);
  log('═'.repeat(60), colors.cyan);

  let backendProcess, frontendProcess;

  try {
    // Start backend first
    backendProcess = await startBackend();

    // Wait a bit for backend to fully start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend
    frontendProcess = await startFrontend();

    log('\n' + '═'.repeat(60), colors.green);
    log(`
✓ ${colors.bright}Servers are starting!${colors.reset}

  ${colors.cyan}Frontend:${colors.reset} http://localhost:5173
  ${colors.cyan}Backend:${colors.reset}  http://localhost:8000

${colors.yellow}Press Ctrl+C to stop all servers${colors.reset}
`, colors.green);
    log('═'.repeat(60), colors.green);

    // Handle shutdown
    const shutdown = () => {
      log('\n\n🛑 Shutting down servers...', colors.yellow);
      if (backendProcess) backendProcess.kill();
      if (frontendProcess) frontendProcess.kill();
      setTimeout(() => {
        log('✓ Servers stopped\n', colors.green);
        process.exit(0);
      }, 1000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    // Keep the process running
    await new Promise(() => {});

  } catch (error) {
    log(`\n✗ Failed to start servers: ${error.message}`, colors.red);
    if (backendProcess) backendProcess.kill();
    if (frontendProcess) frontendProcess.kill();
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n✗ Error: ${error.message}`, colors.red);
  process.exit(1);
});
