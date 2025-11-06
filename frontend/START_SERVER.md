# How to Start LumenFlow Frontend

## Quick Start

1. **Open a terminal/PowerShell window**

2. **Navigate to the frontend directory:**
   ```powershell
   cd C:\Users\micha\Projects\webm-alpha-GhostStage\frontend
   ```

3. **Start the development server:**
   ```powershell
   npm run dev
   ```

4. **Wait for the "Ready" message:**
   ```
   ▲ Next.js 14.2.33
   - Local:        http://localhost:3000
   - Ready in X.Xs
   ```

5. **Open your browser:**
   - Go to: http://localhost:3000
   - You should see the LumenFlow interface

## If Port 3000 is Already in Use

```powershell
# Kill any process on port 3000
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
  Select-Object -ExpandProperty OwningProcess | 
  Stop-Process -Force -ErrorAction SilentlyContinue

# Then start the server
npm run dev
```

## If You See Compilation Errors

1. Check the terminal output for specific error messages
2. Common fixes:
   - Run `npm install` again
   - Delete `node_modules` and `.next` folders, then reinstall
   - Check for TypeScript errors

## Need Help?

Check `TROUBLESHOOTING.md` for more detailed solutions.

