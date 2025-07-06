# bcrypt Deployment Guide

This guide helps you resolve bcrypt deployment issues, particularly the "invalid ELF header" error that occurs when native binaries are compiled for a different architecture than the deployment environment.

## 🚨 Common Error

```
Error: /opt/render/project/src/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node: invalid ELF header
    at Object..node (node:internal/modules/cjs/loader:1921:18)
```

## 🔍 Root Cause

This error occurs when:
- bcrypt native binaries were compiled on a different platform (e.g., Windows/macOS) than the deployment environment (e.g., Linux)
- The deployment platform has a different architecture (x86 vs ARM)
- Node.js versions differ between development and production

## 🛠️ Quick Fix

### Option 1: Automated Script (Recommended)
```bash
npm run prepare-deployment
```

### Option 2: Platform-Specific Scripts

**For Unix/Linux/macOS:**
```bash
chmod +x scripts/fix-bcrypt.sh
./scripts/fix-bcrypt.sh
```

**For Windows:**
```cmd
scripts\fix-bcrypt.bat
```

### Option 3: Manual Fix
```bash
# Remove existing bcrypt
rm -rf node_modules/bcrypt

# Clear cache
npm cache clean --force

# Reinstall from source
npm install bcrypt --build-from-source

# Rebuild
npm rebuild bcrypt
```

## 🧪 Testing

After applying the fix, test bcrypt functionality:
```bash
npm run test-bcrypt
```

## 📋 Platform-Specific Requirements

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install build-essential python3
```

### Linux (CentOS/RHEL/Fedora)
```bash
sudo yum groupinstall 'Development Tools'
sudo yum install python3
```

### macOS
```bash
xcode-select --install
```

### Windows
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install Python 3.x from [python.org](https://www.python.org/downloads/)

## 🚀 Deployment Platform Specific Solutions

### Render
Add to your `package.json`:
```json
{
  "scripts": {
    "build": "npm install && npm rebuild bcrypt --build-from-source"
  }
}
```

### Heroku
Add a `postinstall` script:
```json
{
  "scripts": {
    "postinstall": "npm rebuild bcrypt --build-from-source"
  }
}
```

### Vercel
Create `vercel.json`:
```json
{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["node_modules/bcrypt/**"]
      }
    }
  ]
}
```

### Railway
Add to `railway.toml`:
```toml
[build]
builder = "nixpacks"

[build.nixpacksConfig]
providers = ["node"]

[[build.nixpacksConfig.phases]]
name = "install"
cmds = ["npm ci", "npm rebuild bcrypt --build-from-source"]
```

### DigitalOcean App Platform
Add to `.do/app.yaml`:
```yaml
name: your-app
services:
- name: api
  source_dir: /
  github:
    repo: your-repo
    branch: main
  run_command: npm start
  build_command: npm install && npm rebuild bcrypt --build-from-source
```

## 🔧 Advanced Troubleshooting

### Issue: Build tools not found
**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential python3-dev

# CentOS/RHEL
sudo yum groupinstall 'Development Tools'
sudo yum install python3-devel

# Alpine Linux (Docker)
apk add --no-cache make gcc g++ python3
```

### Issue: Node.js version mismatch
**Solution:**
- Ensure the same Node.js version in development and production
- Use `.nvmrc` file to specify Node.js version:
```
18.17.0
```

### Issue: Memory issues during build
**Solution:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm install
```

### Issue: Permission errors
**Solution:**
```bash
# Fix npm permissions
npm config set unsafe-perm true
npm install bcrypt --build-from-source
```

## 🐳 Docker Solutions

### Dockerfile example:
```dockerfile
FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache make gcc g++ python3

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild bcrypt
RUN npm ci --only=production && \
    npm rebuild bcrypt --build-from-source

# Copy application code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

### Multi-stage build:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
RUN apk add --no-cache make gcc g++ python3
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm rebuild bcrypt --build-from-source

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔄 CI/CD Integration

### GitHub Actions:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm rebuild bcrypt --build-from-source
      - run: npm test
      - run: npm run test-bcrypt
```

### GitLab CI:
```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm rebuild bcrypt --build-from-source
  artifacts:
    paths:
      - node_modules/
```

## 📊 Performance Considerations

### bcrypt rounds recommendation:
- **Development**: 4-6 rounds (faster)
- **Production**: 10-12 rounds (more secure)
- **High-security**: 12-15 rounds (slower but very secure)

### Example configuration:
```javascript
const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 6;
const hash = await bcrypt.hash(password, saltRounds);
```

## 🔍 Debugging

### Check bcrypt installation:
```bash
node -e "console.log(require('bcrypt'))"
```

### Check native binding:
```bash
node -e "console.log(require('bcrypt/lib/binding/napi-v3/bcrypt_lib.node'))"
```

### Verbose npm install:
```bash
npm install bcrypt --build-from-source --verbose
```

## 📞 Support

If you continue to experience issues:

1. **Check Node.js compatibility**: Ensure your Node.js version is supported by bcrypt
2. **Review build logs**: Look for specific error messages during compilation
3. **Platform documentation**: Check your deployment platform's specific requirements
4. **bcrypt GitHub issues**: Search for similar issues on the [bcrypt repository](https://github.com/kelektiv/node.bcrypt.js/issues)

## 📚 Additional Resources

- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [Node.js native addons](https://nodejs.org/api/addons.html)
- [Platform-specific build tools](https://github.com/nodejs/node-gyp#installation)

---

**Last updated**: December 2024
**bcrypt version**: 5.1.1
**Node.js compatibility**: 16.x, 18.x, 20.x
