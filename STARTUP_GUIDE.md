# CRM Business Predictor - Startup Guide

## Quick Start (Recommended)

The easiest way to run the application is with a single command:

```bash
npm start
```

This will:
- ✅ Automatically check and install dependencies
- ✅ Start the backend server (Python/FastAPI)
- ✅ Wait for backend to be healthy
- ✅ Start the frontend server (Vite/React)
- ✅ Open your application at http://localhost:5173

## Available Commands

### Production Commands

| Command | Description |
|---------|-------------|
| `npm start` | **Start both frontend and backend** (recommended) |
| `npm run health` | Run comprehensive health check to diagnose issues |
| `npm run setup` | Initial setup and dependency installation |

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (warns if backend is not running) |
| `npm run dev:frontend-only` | Start only frontend (no warnings) |
| `npm run backend` | Start only backend server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## First Time Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-crm-business-predictor
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```
   This will install both Node.js and Python dependencies.

3. **Start the application**
   ```bash
   npm start
   ```

## Troubleshooting

### Issue: "ECONNREFUSED" or "Backend not ready"

**Problem**: The frontend is running but can't connect to the backend.

**Solutions**:
1. Stop the frontend (Ctrl+C)
2. Run `npm start` instead of `npm run dev`
3. Or start the backend separately: `npm run backend`

### Issue: "Backend health check failed"

**Problem**: Backend server won't start.

**Solutions**:
1. Check Python is installed: `python3 --version` (or `python --version`)
2. Install Python dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
3. Check if port 8000 is already in use
4. Run health check for detailed diagnosis: `npm run health`

### Issue: Port already in use

**Problem**: Port 5173 or 8000 is already occupied.

**Solutions**:
- Find and kill the process using the port:
  ```bash
  # On Linux/Mac
  lsof -ti:5173 | xargs kill -9
  lsof -ti:8000 | xargs kill -9

  # On Windows
  netstat -ano | findstr :5173
  taskkill /PID <PID> /F
  ```

### Issue: Python packages missing

**Problem**: Import errors when starting backend.

**Solution**:
```bash
pip install -r backend/requirements.txt
# or
pip3 install -r backend/requirements.txt
```

## Running Health Check

To diagnose issues, run the comprehensive health check:

```bash
npm run health
```

This will check:
- ✓ Node.js and npm installation
- ✓ Python installation
- ✓ Node modules installed
- ✓ Python dependencies installed
- ✓ Backend server status
- ✓ Frontend server status
- ✓ Port availability

## Architecture

### Backend Server
- **Technology**: Python, FastAPI, Uvicorn
- **Port**: 8000
- **Endpoints**: `/api/*`
- **Features**: AI predictions, risk analysis, auto-runner

### Frontend Server
- **Technology**: React, Vite
- **Port**: 5173
- **Proxy**: All `/api` requests are proxied to backend (port 8000)

## Advanced Features

### Automatic Retry Logic
The frontend API client includes:
- ✅ Automatic retry with exponential backoff (3 retries)
- ✅ Circuit breaker pattern (opens after 5 failures)
- ✅ Graceful degradation
- ✅ Connection status monitoring

### Backend Status Monitor
A real-time backend connection monitor is displayed in the UI when:
- Backend is not reachable
- Connection errors occur
- Circuit breaker is open

The monitor provides:
- Live connection status
- Troubleshooting steps
- Manual retry button
- Helpful error messages

### Smart Dev Command
When you run `npm run dev`, it will:
1. Check if backend is running
2. Warn you if it's not
3. Suggest using `npm start` instead
4. Give you 3 seconds to cancel
5. Start frontend anyway (if you choose to continue)

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
HOST=0.0.0.0
PORT=8000
OPENAI_API_KEY=your_key_here  # Optional
```

## GPU Support

The backend automatically detects GPU availability:
- If CUDA-compatible GPU is available, it will use it
- Otherwise, it falls back to CPU mode
- Check GPU status: http://localhost:8000/api/system-info

## Common Workflows

### Development Workflow
```bash
# Start everything
npm start

# In another terminal, watch for file changes
# (The dev servers already have hot-reload enabled)
```

### Backend-Only Development
```bash
# Terminal 1: Backend
npm run backend

# Terminal 2: Frontend (once backend is ready)
npm run dev
```

### Testing Production Build
```bash
# Build
npm run build

# Preview
npm run preview
```

## Getting Help

1. Run health check: `npm run health`
2. Check server logs in the terminal
3. Check browser console for frontend errors
4. Check backend terminal for API errors
5. Verify all dependencies are installed

## Summary

**Always use `npm start` for the best experience!**

This ensures both servers start correctly and all features work as expected.
