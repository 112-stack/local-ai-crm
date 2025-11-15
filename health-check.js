#!/usr/bin/env node

/**
 * Comprehensive health check script
 * Diagnoses common issues with the application
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
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

async function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8000,
        path: '/api/health',
        method: 'GET',
        timeout: 2000
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ running: true, data: JSON.parse(data) });
          } catch {
            resolve({ running: true, data: null });
          }
        });
      }
    );

    req.on('error', () => resolve({ running: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false });
    });

    req.end();
  });
}

async function checkFrontendHealth() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5173,
        path: '/',
        method: 'GET',
        timeout: 2000
      },
      (res) => {
        resolve(res.statusCode === 200 || res.statusCode === 304);
      }
    );

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkPortInUse(port) {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      return stdout.trim().length > 0;
    } else {
      const { stdout } = await execAsync(`lsof -i :${port} || netstat -an | grep ${port}`);
      return stdout.trim().length > 0;
    }
  } catch {
    return false;
  }
}

async function main() {
  log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          CRM Business Predictor - Health Check               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`, colors.bright + colors.cyan);

  let allGood = true;

  // Check Node.js
  log('\n📦 Checking Dependencies...', colors.cyan);
  log('─'.repeat(60));

  try {
    const { stdout } = await execAsync('node --version');
    log(`✓ Node.js: ${stdout.trim()}`, colors.green);
  } catch {
    log('✗ Node.js: Not found', colors.red);
    allGood = false;
  }

  // Check npm
  try {
    const { stdout } = await execAsync('npm --version');
    log(`✓ npm: ${stdout.trim()}`, colors.green);
  } catch {
    log('✗ npm: Not found', colors.red);
    allGood = false;
  }

  // Check Python
  const hasPython3 = await checkCommand('python3');
  const hasPython = await checkCommand('python');

  if (hasPython3 || hasPython) {
    try {
      const cmd = hasPython3 ? 'python3' : 'python';
      const { stdout } = await execAsync(`${cmd} --version`);
      log(`✓ Python: ${stdout.trim()}`, colors.green);
    } catch {
      log('⚠ Python: Found but version check failed', colors.yellow);
    }
  } else {
    log('✗ Python: Not found', colors.red);
    log('  Install Python 3.8+ from https://www.python.org/', colors.yellow);
    allGood = false;
  }

  // Check node_modules
  log('\n📁 Checking Installation...', colors.cyan);
  log('─'.repeat(60));

  if (existsSync(join(__dirname, 'node_modules'))) {
    log('✓ Node modules installed', colors.green);
  } else {
    log('✗ Node modules not installed', colors.red);
    log('  Run: npm install', colors.yellow);
    allGood = false;
  }

  if (existsSync(join(__dirname, 'backend'))) {
    log('✓ Backend directory exists', colors.green);
  } else {
    log('✗ Backend directory not found', colors.red);
    allGood = false;
  }

  // Check Python packages
  if (hasPython3 || hasPython) {
    try {
      const cmd = hasPython3 ? 'python3' : 'python';
      await execAsync(`${cmd} -c "import fastapi, uvicorn"`);
      log('✓ Python dependencies installed', colors.green);
    } catch {
      log('⚠ Python dependencies missing or incomplete', colors.yellow);
      log('  Run: pip install -r backend/requirements.txt', colors.yellow);
      allGood = false;
    }
  }

  // Check servers
  log('\n🚀 Checking Servers...', colors.cyan);
  log('─'.repeat(60));

  const backendHealth = await checkBackendHealth();
  if (backendHealth.running) {
    log('✓ Backend server is running on port 8000', colors.green);
    if (backendHealth.data) {
      log(`  GPU Available: ${backendHealth.data.gpu_available ? 'Yes' : 'No'}`, colors.cyan);
      log(`  Model Loaded: ${backendHealth.data.model_loaded ? 'Yes' : 'No'}`, colors.cyan);
    }
  } else {
    const port8000InUse = await checkPortInUse(8000);
    if (port8000InUse) {
      log('⚠ Port 8000 is in use but backend is not responding', colors.yellow);
      log('  Something else might be using port 8000', colors.yellow);
    } else {
      log('✗ Backend server is not running', colors.yellow);
      log('  Start with: npm run backend (or npm start)', colors.yellow);
    }
  }

  const frontendRunning = await checkFrontendHealth();
  if (frontendRunning) {
    log('✓ Frontend server is running on port 5173', colors.green);
  } else {
    const port5173InUse = await checkPortInUse(5173);
    if (port5173InUse) {
      log('⚠ Port 5173 is in use but frontend is not responding', colors.yellow);
    } else {
      log('✗ Frontend server is not running', colors.yellow);
      log('  Start with: npm run dev (or npm start)', colors.yellow);
    }
  }

  // Final summary
  log('\n' + '═'.repeat(60), colors.cyan);
  if (allGood && backendHealth.running && frontendRunning) {
    log('✅ All systems operational!', colors.bright + colors.green);
    log('\nYou can access the application at:', colors.green);
    log('  🌐 http://localhost:5173\n', colors.bright + colors.cyan);
  } else if (allGood) {
    log('⚠️  Dependencies OK, but servers need to be started', colors.yellow);
    log('\nTo start both servers, run:', colors.yellow);
    log('  npm start\n', colors.bright + colors.green);
  } else {
    log('❌ Some issues need to be resolved', colors.red);
    log('\nPlease fix the issues above and run this check again.\n', colors.yellow);
  }

  process.exit(allGood ? 0 : 1);
}

main().catch(error => {
  log(`\n✗ Error: ${error.message}`, colors.red);
  process.exit(1);
});
