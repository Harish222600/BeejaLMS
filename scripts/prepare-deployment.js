#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * This script prepares the application for deployment by rebuilding bcrypt
 * and other native dependencies for the target platform.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment preparation...');

function runCommand(command, description) {
    console.log(`\n📦 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
        console.log(`✅ ${description} completed successfully`);
        return true;
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        return false;
    }
}

function checkNodeModules() {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    return fs.existsSync(nodeModulesPath);
}

function main() {
    console.log('🔍 Checking environment...');
    
    // Check if we're in the right directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.error('❌ package.json not found. Please run this script from the project root.');
        process.exit(1);
    }

    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`📋 Node.js version: ${nodeVersion}`);
    
    // Check platform
    const platform = process.platform;
    const arch = process.arch;
    console.log(`🖥️  Platform: ${platform} (${arch})`);

    let success = true;

    // Step 1: Clean node_modules if it exists
    if (checkNodeModules()) {
        console.log('\n🧹 Cleaning existing node_modules...');
        try {
            if (platform === 'win32') {
                execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
            } else {
                execSync('rm -rf node_modules', { stdio: 'inherit' });
            }
            console.log('✅ node_modules cleaned successfully');
        } catch (error) {
            console.log('⚠️  Could not clean node_modules, continuing...');
        }
    }

    // Step 2: Clean package-lock.json
    const lockFilePath = path.join(process.cwd(), 'package-lock.json');
    if (fs.existsSync(lockFilePath)) {
        console.log('\n🧹 Cleaning package-lock.json...');
        try {
            fs.unlinkSync(lockFilePath);
            console.log('✅ package-lock.json cleaned successfully');
        } catch (error) {
            console.log('⚠️  Could not clean package-lock.json, continuing...');
        }
    }

    // Step 3: Clear npm cache
    success = runCommand('npm cache clean --force', 'Clearing npm cache') && success;

    // Step 4: Install dependencies
    success = runCommand('npm install', 'Installing dependencies') && success;

    // Step 5: Rebuild native modules
    success = runCommand('npm rebuild', 'Rebuilding native modules') && success;

    // Step 6: Specifically rebuild bcrypt
    success = runCommand('npm rebuild bcrypt --build-from-source', 'Rebuilding bcrypt from source') && success;

    // Step 7: Test bcrypt installation
    console.log('\n🧪 Testing bcrypt installation...');
    try {
        const bcrypt = require('bcrypt');
        const testPassword = 'test123';
        const hash = bcrypt.hashSync(testPassword, 10);
        const isValid = bcrypt.compareSync(testPassword, hash);
        
        if (isValid) {
            console.log('✅ bcrypt is working correctly');
        } else {
            console.error('❌ bcrypt test failed - hash comparison failed');
            success = false;
        }
    } catch (error) {
        console.error('❌ bcrypt test failed:', error.message);
        success = false;
    }

    // Final status
    console.log('\n' + '='.repeat(50));
    if (success) {
        console.log('🎉 Deployment preparation completed successfully!');
        console.log('📝 Your application is ready for deployment.');
        console.log('\n💡 Next steps:');
        console.log('   1. Commit your changes');
        console.log('   2. Deploy to your platform');
        console.log('   3. Run "npm run test-bcrypt" on the deployed environment to verify');
    } else {
        console.log('❌ Deployment preparation failed!');
        console.log('📝 Please check the errors above and try again.');
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Ensure you have the latest Node.js version');
        console.log('   2. Check if you have build tools installed (python, make, gcc)');
        console.log('   3. Try running "npm install --build-from-source"');
        process.exit(1);
    }
}

// Run the script
main();
