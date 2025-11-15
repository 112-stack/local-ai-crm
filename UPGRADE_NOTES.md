# CUDA 12 Upgrade Notes

## What's New

This upgrade brings significant improvements to the installation process and package versions:

### 🚀 Major Changes

1. **CUDA 12.1 Support**
   - Upgraded from CUDA 11.8 to CUDA 12.1
   - Better performance and compatibility with latest NVIDIA drivers
   - Automatic environment variable configuration

2. **Package Upgrades**
   - PyTorch: Now using CUDA 12.1 builds (`cu121`)
   - FastAPI: 0.104.1 → 0.115.5
   - Uvicorn: 0.24.0 → 0.34.0
   - Transformers: 4.35.2 → 4.47.1
   - NumPy: 1.26.2 → 1.26.4+ (with pre-built wheel support)
   - Pandas: 2.1.3 → 2.2.3
   - Scikit-learn: 1.3.2 → 1.6.0
   - And many more...

3. **Installation Improvements**
   - ✅ Pre-built wheel installation to avoid compilation errors
   - ✅ Automatic CUDA environment variable setup
   - ✅ Better error handling and retry logic
   - ✅ No C compiler needed for NumPy installation
   - ✅ Added `accelerate` for better model loading performance

### 🐛 Bug Fixes

**NumPy Compilation Error:**
```
ERROR: Unknown compiler(s): [['icl'], ['cl'], ['cc'], ['gcc'], ['clang']]
```
**Solution:** Now uses pre-built binary wheels (`--only-binary`) to avoid compilation

**PyTorch CUDA Version Mismatch:**
```
ERROR: Could not find a version that satisfies the requirement torch
```
**Solution:** Updated to correct CUDA 12.1 index: `https://download.pytorch.org/whl/cu121`

**Missing CUDA Environment Variables:**
**Solution:** Installer now automatically sets:
- `CUDA_PATH` / `CUDA_HOME`
- Adds CUDA bin to `PATH`
- Adds CUDA lib to `LD_LIBRARY_PATH` (Linux)

## Installation

### Fresh Installation

```bash
# Windows
install.bat

# Linux/Mac
./install.sh
```

The installer will:
1. Detect your GPU
2. Download PyTorch with CUDA 12.1 support
3. Install all dependencies using pre-built wheels
4. Configure CUDA environment variables automatically
5. Create configuration files

### Upgrading Existing Installation

If you have an existing installation:

```bash
# 1. Backup your .env file
cp backend/.env backend/.env.backup

# 2. Remove old virtual environment
rm -rf backend/venv  # Linux/Mac
# or
rmdir /s backend\venv  # Windows

# 3. Run the installer
./install.sh  # Linux/Mac
# or
install.bat   # Windows

# 4. Restore your custom .env settings
# Compare backend/.env.backup with backend/.env and merge your custom settings
```

## Verification

After installation, verify everything works:

```bash
# Check CUDA is available
nvidia-smi

# Check PyTorch can see CUDA
cd backend
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate.bat  # Windows

python -c "import torch; print(f'PyTorch version: {torch.__version__}'); print(f'CUDA available: {torch.cuda.is_available()}'); print(f'CUDA version: {torch.version.cuda}')"
```

Expected output:
```
PyTorch version: 2.x.x+cu121
CUDA available: True
CUDA version: 12.1
```

## Troubleshooting

### Issue: "CUDA not found" or torch.cuda.is_available() returns False

**Solutions:**
1. Verify CUDA Toolkit 12.1+ is installed:
   ```bash
   nvcc --version
   ```

2. Check environment variables:
   ```bash
   # Windows
   echo %CUDA_PATH%
   echo %CUDA_HOME%

   # Linux
   echo $CUDA_HOME
   echo $PATH
   ```

3. Reinstall PyTorch with CUDA support:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   ```

### Issue: NumPy installation still fails

**Solutions:**
1. Use the installer script instead of manual pip install
2. Or manually install with binary-only flag:
   ```bash
   pip install --only-binary=:all: numpy
   ```

### Issue: Missing dependencies

**Solutions:**
Ensure you're installing from the updated requirements.txt:
```bash
cd backend
pip install -r requirements.txt
```

## Performance Improvements

With CUDA 12.1, you should see:
- Faster model inference (5-15% improvement)
- Better memory management
- Support for latest NVIDIA GPUs (RTX 40-series, etc.)
- Improved stability with Transformers 4.47.1

## Breaking Changes

⚠️ **CUDA Version:** If you have CUDA 11.x installed, you should upgrade to CUDA 12.1+

⚠️ **Python Version:** Minimum Python version is now 3.9 (was 3.8)

⚠️ **Node.js Version:** Minimum Node.js version is now 18 (was 16)

## Additional Notes

- The installer uses pre-built wheels whenever possible to avoid compilation
- CUDA environment variables are automatically configured on both Windows and Linux
- All package versions have been updated to their latest stable releases
- The `accelerate` library is now included for better performance with large models
