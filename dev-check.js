#!/usr/bin/env node

/**
 * Smart dev script that checks if backend is running
 * If not, it warns the user and suggests using npm start
 */

import { spawn } from 'child_process';
import http from 'http';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkBackendRunning() {
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
        resolve(res.statusCode === 200);
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

async function main() {
  log('\n🔍 Checking backend server status...', colors.cyan);

  const isBackendRunning = await checkBackendRunning();

  if (!isBackendRunning) {
    log('\n' + '═'.repeat(70), colors.yellow);
    log('⚠️  WARNING: Backend Server Not Running!', colors.bright + colors.yellow);
    log('═'.repeat(70), colors.yellow);
    log('\nThe frontend will start, but API requests will fail.', colors.yellow);
    log('\nTo run BOTH frontend and backend together, use:', colors.yellow);
    log('  npm start', colors.bright + colors.green);
    log('\nOr start the backend separately with:', colors.yellow);
    log('  npm run backend', colors.bright + colors.cyan);
    log('\n' + '═'.repeat(70) + '\n', colors.yellow);

    // Ask user if they want to continue
    log('Starting frontend only in 3 seconds...', colors.yellow);
    log('Press Ctrl+C to cancel and run "npm start" instead.\n', colors.yellow);

    await new Promise(resolve => setTimeout(resolve, 3000));
  } else {
    log('✓ Backend is running!', colors.green);
    log('Starting frontend...\n', colors.cyan);
  }

  // Start Vite
  const vite = spawn('vite', [], {
    stdio: 'inherit',
    shell: true
  });

  vite.on('error', (error) => {
    log(`\n✗ Failed to start Vite: ${error.message}`, colors.red);
    process.exit(1);
  });

  vite.on('exit', (code) => {
    process.exit(code || 0);
  });

  // Handle shutdown
  const shutdown = () => {
    vite.kill();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(error => {
  log(`\n✗ Error: ${error.message}`, colors.red);
  process.exit(1);
});
