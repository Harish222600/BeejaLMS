#!/bin/bash

# Fix bcrypt deployment issues on Unix-based systems
# This script rebuilds bcrypt native binaries for the current platform

echo "🔧 Fixing bcrypt for deployment..."
echo "Platform: $(uname -s) $(uname -m)"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 completed successfully"
    else
        echo "❌ $1 failed"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Remove bcrypt from node_modules
echo "🧹 Removing existing bcrypt installation..."
rm -rf node_modules/bcrypt
check_success "bcrypt removal"

# Step 2: Clear npm cache for bcrypt
echo "🧹 Clearing npm cache for bcrypt..."
npm cache clean bcrypt --force 2>/dev/null || true
check_success "cache clearing"

# Step 3: Install bcrypt with build from source
echo "📦 Installing bcrypt from source..."
npm install bcrypt --build-from-source
check_success "bcrypt installation"

# Step 4: Rebuild bcrypt
echo "🔨 Rebuilding bcrypt..."
npm rebuild bcrypt
check_success "bcrypt rebuild"

# Step 5: Test bcrypt
echo "🧪 Testing bcrypt installation..."
node -e "
const bcrypt = require('bcrypt');
const testPassword = 'test123';
console.log('Testing bcrypt...');
const hash = bcrypt.hashSync(testPassword, 10);
const isValid = bcrypt.compareSync(testPassword, hash);
if (isValid) {
    console.log('✅ bcrypt is working correctly');
    process.exit(0);
} else {
    console.log('❌ bcrypt test failed');
    process.exit(1);
}
"
check_success "bcrypt test"

echo ""
echo "🎉 bcrypt has been successfully fixed for deployment!"
echo "📝 You can now deploy your application."
echo ""
echo "💡 If you still encounter issues:"
echo "   1. Make sure you have build tools installed:"
echo "      - Ubuntu/Debian: sudo apt-get install build-essential python3"
echo "      - CentOS/RHEL: sudo yum groupinstall 'Development Tools' python3"
echo "      - macOS: xcode-select --install"
echo "   2. Try running: npm install --build-from-source"
echo "   3. Check Node.js version compatibility"
