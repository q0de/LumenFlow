# Troubleshooting LumenFlow Frontend

## Server Won't Start or Can't Connect

### Check if Server is Running

```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check Node processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Common Issues

1. **Port Already in Use**
   ```powershell
   # Kill process on port 3000
   Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
   ```

2. **Missing Dependencies**
   ```powershell
   cd frontend
   npm install
   ```

3. **Compilation Errors**
   - Check the terminal output when running `npm run dev`
   - Look for TypeScript or import errors
   - Verify all files are in place

4. **Path Resolution Issues**
   - Ensure `tsconfig.json` has correct paths: `"@/*": ["./*"]`
   - Verify `lib/jobs.ts` exists

### Manual Start

1. Open a new terminal
2. Navigate to frontend directory:
   ```powershell
   cd frontend
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```
4. Wait for "Ready" message
5. Open browser to http://localhost:3000

### Check Server Logs

The dev server should show:
- Compilation status
- Any errors
- "Ready" message when server is up
- URL where it's running

### Alternative: Use Different Port

If port 3000 is blocked:
```powershell
npm run dev -- -p 3001
```

Then access: http://localhost:3001

