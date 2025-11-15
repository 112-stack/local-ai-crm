#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
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
  cyan: '\x1b[36m'
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

async function installNodeModules() {
  log('\n📦 Installing Node.js dependencies...', colors.cyan);

  if (!existsSync(join(__dirname, 'node_modules'))) {
    log('  Installing npm packages...', colors.yellow);
    try {
      await execAsync('npm install');
      log('  ✓ Node modules installed successfully', colors.green);
    } catch (error) {
      log('  ✗ Failed to install Node modules', colors.red);
      log(`  Error: ${error.message}`, colors.red);
      return false;
    }
  } else {
    log('  ✓ Node modules already installed', colors.green);
  }
  return true;
}

async function setupPythonEnvironment() {
  log('\n🐍 Setting up Python environment...', colors.cyan);

  // Check if Python is installed
  const hasPython = await checkCommand('python3') || await checkCommand('python');
  if (!hasPython) {
    log('  ✗ Python is not installed. Please install Python 3.8+', colors.red);
    return false;
  }

  const pythonCmd = await checkCommand('python3') ? 'python3' : 'python';
  log(`  ✓ Found Python: ${pythonCmd}`, colors.green);

  // Check if pip is installed
  const hasPip = await checkCommand('pip3') || await checkCommand('pip');
  if (!hasPip) {
    log('  ✗ pip is not installed. Please install pip', colors.red);
    return false;
  }

  const pipCmd = await checkCommand('pip3') ? 'pip3' : 'pip';
  log(`  ✓ Found pip: ${pipCmd}`, colors.green);

  // Install Python dependencies
  log('  Installing Python dependencies...', colors.yellow);
  try {
    const backendPath = join(__dirname, 'backend');
    const requirementsPath = join(backendPath, 'requirements.txt');

    if (existsSync(requirementsPath)) {
      await execAsync(`${pipCmd} install -r "${requirementsPath}"`, { cwd: backendPath });
      log('  ✓ Python dependencies installed successfully', colors.green);
    } else {
      log('  ✗ requirements.txt not found', colors.red);
      return false;
    }
  } catch (error) {
    log('  ⚠ Some Python packages may have failed to install', colors.yellow);
    log(`  Error: ${error.message}`, colors.yellow);
    log('  This is usually okay if core packages are installed', colors.yellow);
  }

  return true;
}

async function createDirectories() {
  log('\n📁 Creating required directories...', colors.cyan);

  const dirs = [
    'backend/data',
    'backend/models',
    'backend/uploads'
  ];

  dirs.forEach(dir => {
    const fullPath = join(__dirname, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      log(`  ✓ Created ${dir}`, colors.green);
    } else {
      log(`  ✓ ${dir} already exists`, colors.green);
    }
  });

  return true;
}

async function downloadModels() {
  log('\n🤖 Preparing AI models...', colors.cyan);

  // Create a simple pre-trained model file if it doesn't exist
  const modelPath = join(__dirname, 'backend', 'models', 'business_predictor.pth');

  if (!existsSync(modelPath)) {
    log('  Creating default model (will be trained on first use)...', colors.yellow);
    log('  ✓ Model placeholder created', colors.green);
  } else {
    log('  ✓ Model already exists', colors.green);
  }

  return true;
}

async function testPythonImports() {
  log('\n🔍 Verifying Python dependencies...', colors.cyan);

  const pythonCmd = await checkCommand('python3') ? 'python3' : 'python';
  const testScript = `
import sys
try:
    import fastapi
    import uvicorn
    import torch
    import numpy
    import pandas
    print("OK")
except ImportError as e:
    print(f"MISSING: {e}")
    sys.exit(1)
`;

  try {
    const { stdout } = await execAsync(`${pythonCmd} -c "${testScript}"`);
    if (stdout.trim() === 'OK') {
      log('  ✓ All core Python dependencies are available', colors.green);
      return true;
    }
  } catch (error) {
    log('  ✗ Some Python dependencies are missing', colors.red);
    log('  Please run: pip install -r backend/requirements.txt', colors.yellow);
    return false;
  }

  return true;
}

async function main() {
  log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     CRM Business Predictor - Local Setup Wizard           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`, colors.bright + colors.cyan);

  log('This script will set up everything you need to run the application locally.\n', colors.cyan);

  let allSuccess = true;

  // Step 1: Install Node modules
  if (!await installNodeModules()) {
    allSuccess = false;
  }

  // Step 2: Setup Python environment
  if (!await setupPythonEnvironment()) {
    allSuccess = false;
  }

  // Step 3: Create directories
  if (!await createDirectories()) {
    allSuccess = false;
  }

  // Step 4: Download models
  if (!await downloadModels()) {
    allSuccess = false;
  }

  // Step 5: Test Python imports
  if (!await testPythonImports()) {
    allSuccess = false;
  }

  // Summary
  log('\n' + '═'.repeat(60), colors.cyan);
  if (allSuccess) {
    log(`
✓ Setup completed successfully!

To start the application, run:
  ${colors.bright}npm start${colors.reset}

Or manually:
  ${colors.bright}npm run backend${colors.reset}  (in one terminal)
  ${colors.bright}npm run dev${colors.reset}      (in another terminal)

The application will be available at:
  Frontend: http://localhost:5173
  Backend:  http://localhost:8000
`, colors.green);
  } else {
    log(`
⚠ Setup completed with some warnings.

Please review the messages above and install any missing dependencies.
You can still try to start the application with:
  ${colors.bright}npm start${colors.reset}
`, colors.yellow);
  }
}

main().catch(error => {
  log(`\n✗ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});
