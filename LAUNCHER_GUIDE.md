# CRM Business Predictor - Launcher Guide

Complete guide for auto-running the React CRM Business Predictor application with custom icons and executables.

## Quick Start

### Easiest Method (Recommended)
Simply double-click: **`auto-run.bat`**

This will automatically:
- ✓ Check for required dependencies
- ✓ Install missing packages
- ✓ Start backend server (http://localhost:8000)
- ✓ Start frontend server (http://localhost:5173)
- ✓ Open in separate windows

---

## Available Launchers

### 1. `auto-run.bat` - Full Featured Launcher
**Best for:** First-time users and troubleshooting

Features:
- Automatic dependency checking
- Runs installation if needed
- Creates backend configuration
- Shows detailed status messages
- Opens servers in separate windows

**Usage:**
```bash
# Double-click the file, or run:
auto-run.bat
```

### 2. `auto-run.cmd` - Quick Launcher
**Best for:** Regular use after initial setup

Features:
- Fast startup
- Minimal messages
- Quick dependency check
- Same functionality, less verbose

**Usage:**
```bash
# Double-click the file, or run:
auto-run.cmd
```

### 3. `launcher.vbs` - VBScript Launcher with Browser
**Best for:** Complete automation

Features:
- Launches application
- Automatically opens browser after 8 seconds
- Minimal user interaction

**Usage:**
```bash
# Double-click the file, or run:
wscript launcher.vbs
```

### 4. `launcher-silent.vbs` - Silent Background Launcher
**Best for:** Silent background startup

Features:
- No command windows shown
- Runs completely in background
- Shows notification when started
- Perfect for startup scripts

**Usage:**
```bash
# Double-click the file, or run:
wscript launcher-silent.vbs
```

### 5. `CRM-Launcher.exe` - Custom Executable (Optional)
**Best for:** Professional deployment with custom icon

Features:
- Standalone executable
- Custom application icon
- Can be pinned to taskbar
- Professional appearance
- Creates desktop shortcuts

**Setup:**
1. Run `create-icon.ps1` to create the icon
2. Run `create-exe.ps1` to build the executable
3. Double-click `CRM-Launcher.exe`

---

## Creating the Executable with Icon

### Step 1: Create the Icon

Run PowerShell as Administrator:
```powershell
.\create-icon.ps1
```

This script will:
- Check for ImageMagick (optional)
- Create icon from SVG file
- Provide alternative methods if needed

**Manual Icon Creation:**
If automated creation fails, use one of these:

**Option A: Online Converter**
1. Upload `app-icon.svg` to: https://convertio.co/svg-ico/
2. Download as `app-icon.ico`
3. Save in project root

**Option B: GIMP (Free)**
1. Download GIMP: https://www.gimp.org/
2. Open `app-icon.svg`
3. Export as `app-icon.ico` (256x256 recommended)

### Step 2: Build the Executable

Run PowerShell as Administrator:
```powershell
.\create-exe.ps1
```

This script will:
- Verify dependencies exist
- Compile C# launcher code
- Embed the custom icon
- Create `CRM-Launcher.exe`
- Optionally create desktop shortcut

**Requirements:**
- .NET Framework 4.0+ (pre-installed on Windows 7+)
- C# compiler (csc.exe)

### Step 3: Use the Executable

Once created, you can:
- Double-click `CRM-Launcher.exe` to start
- Create desktop shortcuts
- Pin to taskbar
- Pin to Start menu
- Add to Windows startup

---

## Server Information

When the application starts:

| Service  | URL                      | Purpose                |
|----------|--------------------------|------------------------|
| Backend  | http://localhost:8000    | API and ML processing  |
| Frontend | http://localhost:5173    | User interface         |

### Accessing the Application
1. Wait for both servers to start (3-5 seconds)
2. Open browser to: http://localhost:5173
3. Backend API is at: http://localhost:8000

---

## Adding to Windows Startup

### Method 1: Using Startup Folder
1. Press `Win + R`
2. Type: `shell:startup`
3. Press Enter
4. Create shortcut to `launcher-silent.vbs` or `CRM-Launcher.exe`

### Method 2: Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "At log on"
4. Action: Start program
5. Program: Path to `launcher-silent.vbs` or `CRM-Launcher.exe`

---

## Creating Desktop Shortcuts

### Automatic (using create-exe.ps1)
The script prompts to create a desktop shortcut automatically.

### Manual Creation
1. Right-click on desktop
2. New → Shortcut
3. Browse to `auto-run.bat` or `CRM-Launcher.exe`
4. Name it: "CRM Business Predictor"
5. (Optional) Right-click shortcut → Properties → Change Icon → Browse to `app-icon.ico`

---

## Customization

### Changing Server Ports

Edit `backend/.env`:
```env
HOST=0.0.0.0
PORT=8000  # Change backend port here
```

For frontend port, edit `package.json`:
```json
"scripts": {
  "dev": "vite --port 5173"  // Change frontend port here
}
```

### Auto-open Browser

To automatically open browser, use:
- `launcher.vbs` - opens browser after 8 seconds
- Or modify `auto-run.bat` to add at the end:
  ```batch
  timeout /t 8
  start http://localhost:5173
  ```

### Running in Background

For completely silent operation:
1. Use `launcher-silent.vbs`
2. Comment out the MsgBox line if you don't want notifications

---

## Troubleshooting

### "Node.js is not installed"
**Solution:** Install Node.js 18+ from https://nodejs.org/

### "Python is not installed"
**Solution:** Install Python 3.9-3.12 from https://www.python.org/

### "Port already in use"
**Solution:**
1. Check if application is already running
2. Close other processes using ports 8000 or 5173
3. Or change ports in configuration (see Customization)

### "Backend failed to start"
**Solution:**
1. Run `install.bat` manually
2. Check `backend/.env` exists
3. Activate venv and run: `pip install -r requirements.txt`

### "Frontend failed to start"
**Solution:**
1. Delete `node_modules` folder
2. Run: `npm install`
3. Try again

### Executable won't compile
**Solution:**
1. Run PowerShell as Administrator
2. Install .NET Framework 4.0+
3. Or use alternative methods (ps2exe)

### Icon not showing
**Solution:**
1. Ensure `app-icon.ico` exists
2. Use online converter if `create-icon.ps1` fails
3. Rebuild executable after creating icon

---

## File Overview

| File | Type | Purpose |
|------|------|---------|
| `auto-run.bat` | Batch | Full-featured launcher with checks |
| `auto-run.cmd` | CMD | Quick launcher for regular use |
| `launcher.vbs` | VBScript | Auto-opens browser |
| `launcher-silent.vbs` | VBScript | Silent background launcher |
| `app-icon.svg` | SVG | Source icon file |
| `app-icon.ico` | Icon | Windows icon (created by script) |
| `create-icon.ps1` | PowerShell | Icon creation script |
| `create-exe.ps1` | PowerShell | Executable builder |
| `CRM-Launcher.exe` | Executable | Standalone launcher with icon |

---

## Advanced: Command Line Options

### Running with Custom Backend Port
```batch
set PORT=9000 && auto-run.bat
```

### Running Backend Only
```batch
cd backend
call venv\Scripts\activate.bat
python app.py
```

### Running Frontend Only
```batch
npm run dev
```

---

## Best Practices

### For Development
- Use `auto-run.bat` for detailed feedback
- Keep command windows open to see logs
- Check both windows for errors

### For Production/Daily Use
- Use `CRM-Launcher.exe` with custom icon
- Pin to taskbar for quick access
- Use `launcher-silent.vbs` for startup automation

### For Sharing
- Share entire project folder
- Include `auto-run.bat` for easy setup
- Users just double-click to start

---

## Security Notes

- All launchers run locally on your machine
- No external connections required (after initial setup)
- Backend runs on localhost only (0.0.0.0:8000)
- Frontend runs on localhost only (0.0.0.0:5173)

To expose to network, edit `backend/.env`:
```env
HOST=0.0.0.0  # Already set - accessible from network
```

Then access from other devices: `http://YOUR_IP:5173`

---

## Uninstallation

To remove the launchers:
1. Delete the launcher files listed above
2. Remove shortcuts from Desktop/Taskbar
3. Remove from Startup folder if added
4. Remove Task Scheduler entry if created

To fully uninstall the application:
```batch
# Delete dependencies
rmdir /s /q node_modules
rmdir /s /q backend\venv

# Keep project files, remove launchers
del auto-run.bat auto-run.cmd launcher*.vbs create-*.ps1 CRM-Launcher.exe app-icon.*
```

---

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review error messages in command windows
3. Ensure all prerequisites are installed
4. Try running `install.bat` manually

---

## License

MIT License - Same as main project

---

**Enjoy your automated CRM Business Predictor!** 🚀
