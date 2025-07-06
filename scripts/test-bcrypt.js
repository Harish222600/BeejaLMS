#!/usr/bin/env node

/**
 * bcrypt Test Script
 * This script tests bcrypt functionality to ensure it's working correctly
 * after deployment or installation.
 */

const bcrypt = require('bcrypt');

console.log('🧪 Testing bcrypt functionality...\n');

async function testBcrypt() {
    try {
        console.log('📋 Environment Information:');
        console.log(`   Node.js: ${process.version}`);
        console.log(`   Platform: ${process.platform} (${process.arch})`);
        console.log(`   bcrypt version: ${require('bcrypt/package.json').version}\n`);

        // Test 1: Synchronous operations
        console.log('🔄 Test 1: Synchronous operations');
        const testPassword = 'TestPassword123!';
        const saltRounds = 10;

        console.log('   - Generating salt...');
        const salt = bcrypt.genSaltSync(saltRounds);
        console.log(`   ✅ Salt generated: ${salt.substring(0, 20)}...`);

        console.log('   - Hashing password...');
        const hash = bcrypt.hashSync(testPassword, salt);
        console.log(`   ✅ Password hashed: ${hash.substring(0, 30)}...`);

        console.log('   - Comparing correct password...');
        const isValidCorrect = bcrypt.compareSync(testPassword, hash);
        console.log(`   ✅ Correct password validation: ${isValidCorrect}`);

        console.log('   - Comparing incorrect password...');
        const isValidIncorrect = bcrypt.compareSync('WrongPassword', hash);
        console.log(`   ✅ Incorrect password validation: ${isValidIncorrect}`);

        console.log('   - Getting rounds from hash...');
        const rounds = bcrypt.getRounds(hash);
        console.log(`   ✅ Rounds extracted: ${rounds}\n`);

        // Test 2: Asynchronous operations
        console.log('🔄 Test 2: Asynchronous operations');
        
        console.log('   - Generating salt (async)...');
        const asyncSalt = await bcrypt.genSalt(saltRounds);
        console.log(`   ✅ Async salt generated: ${asyncSalt.substring(0, 20)}...`);

        console.log('   - Hashing password (async)...');
        const asyncHash = await bcrypt.hash(testPassword, asyncSalt);
        console.log(`   ✅ Async password hashed: ${asyncHash.substring(0, 30)}...`);

        console.log('   - Comparing password (async)...');
        const asyncIsValid = await bcrypt.compare(testPassword, asyncHash);
        console.log(`   ✅ Async password validation: ${asyncIsValid}\n`);

        // Test 3: Different salt rounds
        console.log('🔄 Test 3: Different salt rounds');
        const rounds4 = bcrypt.hashSync(testPassword, 4);
        const rounds12 = bcrypt.hashSync(testPassword, 12);
        
        console.log(`   ✅ 4 rounds hash: ${rounds4.substring(0, 30)}...`);
        console.log(`   ✅ 12 rounds hash: ${rounds12.substring(0, 30)}...`);
        console.log(`   ✅ 4 rounds validation: ${bcrypt.compareSync(testPassword, rounds4)}`);
        console.log(`   ✅ 12 rounds validation: ${bcrypt.compareSync(testPassword, rounds12)}\n`);

        // Test 4: Edge cases
        console.log('🔄 Test 4: Edge cases');
        
        console.log('   - Empty string password...');
        const emptyHash = bcrypt.hashSync('', saltRounds);
        const emptyValid = bcrypt.compareSync('', emptyHash);
        console.log(`   ✅ Empty password test: ${emptyValid}`);

        console.log('   - Long password...');
        const longPassword = 'a'.repeat(100);
        const longHash = bcrypt.hashSync(longPassword, saltRounds);
        const longValid = bcrypt.compareSync(longPassword, longHash);
        console.log(`   ✅ Long password test: ${longValid}`);

        console.log('   - Special characters...');
        const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const specialHash = bcrypt.hashSync(specialPassword, saltRounds);
        const specialValid = bcrypt.compareSync(specialPassword, specialHash);
        console.log(`   ✅ Special characters test: ${specialValid}\n`);

        // Performance test
        console.log('🔄 Test 5: Performance test');
        const startTime = Date.now();
        for (let i = 0; i < 5; i++) {
            bcrypt.hashSync(`password${i}`, 10);
        }
        const endTime = Date.now();
        console.log(`   ✅ 5 hashes completed in ${endTime - startTime}ms\n`);

        // Validation checks
        if (!isValidCorrect || isValidIncorrect || !asyncIsValid || 
            !emptyValid || !longValid || !specialValid) {
            throw new Error('One or more validation tests failed');
        }

        if (rounds !== saltRounds) {
            throw new Error(`Round extraction failed: expected ${saltRounds}, got ${rounds}`);
        }

        console.log('🎉 All bcrypt tests passed successfully!');
        console.log('✅ bcrypt is working correctly and ready for production use.\n');

        return true;

    } catch (error) {
        console.error('❌ bcrypt test failed:', error.message);
        console.error('\n🔧 Troubleshooting steps:');
        console.error('   1. Run: npm rebuild bcrypt --build-from-source');
        console.error('   2. Delete node_modules and run: npm install');
        console.error('   3. Check if you have build tools installed');
        console.error('   4. Verify Node.js version compatibility');
        console.error('   5. Try running the fix script: npm run fix-bcrypt\n');
        
        return false;
    }
}

// Run the test
testBcrypt().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
});
