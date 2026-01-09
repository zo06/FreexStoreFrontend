# Clean all caches and rebuild

# Windows Command Prompt
echo "Cleaning project..."

# Remove node_modules
if exist node_modules rmdir /s /q node_modules

# Remove .next build cache
if exist .next rmdir /s /q .next

# Clear browser data instructions
echo "=================================="
echo "IMPORTANT: Clear your browser cache:"
echo "1. Open DevTools (F12)"
echo "2. Right-click the refresh button"
echo "3. Select 'Empty Cache and Hard Reload'"
echo "4. Or clear site data in browser settings"
echo "=================================="

# Reinstall dependencies
echo "Installing dependencies..."
call npm install

# Done
echo "Clean complete! Start the dev server with: npm run dev"
