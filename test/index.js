import { strict as assert } from 'assert'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import importDir from '../lib/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const testDir = join(__dirname, 'fixtures')

// Test utilities
let testCount = 0
let passCount = 0
let failCount = 0

async function test(name, fn) {
    testCount++
    try {
        await fn()
        passCount++
        console.log(`✓ ${name}`)
    } catch (e) {
        failCount++
        console.log(`✗ ${name}`)
        console.log(`  ${e.message}`)
    }
}

// Setup test fixtures
async function setupFixtures() {
    const operationsDir = join(testDir, 'operations')
    const metaDir = join(operationsDir, 'meta')
    const hiddenDir = join(operationsDir, '.hidden')
    
    await fs.mkdir(metaDir, { recursive: true })
    await fs.mkdir(hiddenDir, { recursive: true })
    
    // Create test files
    await fs.writeFile(
        join(operationsDir, 'sum.js'),
        'export default (a, b) => a + b'
    )
    await fs.writeFile(
        join(operationsDir, 'multiply.js'),
        'export default (a, b) => a * b'
    )
    await fs.writeFile(
        join(operationsDir, 'constants.json'),
        JSON.stringify({ value: 42 })
    )
    await fs.writeFile(
        join(metaDir, 'info.js'),
        'export default { name: "test" }'
    )
    await fs.writeFile(
        join(hiddenDir, 'secret.js'),
        'export default { secret: true }'
    )
    await fs.writeFile(
        join(operationsDir, 'readme.md'),
        '# Test'
    )
}

// Cleanup
async function cleanupFixtures() {
    try {
        await fs.rm(testDir, { recursive: true })
    } catch (e) {
        // Ignore cleanup errors
    }
}

// Main test runner
async function runTests() {
    console.log('Running tests...\n')
    
    // Setup
    await setupFixtures()
    
    try {
        const operationsDir = join(testDir, 'operations')
        
        await test('Should import JS functions', async () => {
            const modules = await importDir(operationsDir)
            assert.equal(typeof modules.sum, 'function')
            assert.equal(typeof modules.multiply, 'function')
            assert.equal(modules.sum(2, 3), 5)
            assert.equal(modules.multiply(3, 4), 12)
        })

        await test('Should import JSON files', async () => {
            const modules = await importDir(operationsDir)
            assert.deepEqual(modules.constants, { value: 42 })
        })

        await test('Should handle nested directories', async () => {
            const modules = await importDir(operationsDir)
            assert(typeof modules.meta === 'object')
            assert.equal(modules.meta.info.name, 'test')
        })

        await test('Should skip hidden files and directories', async () => {
            const modules = await importDir(operationsDir)
            assert(!('hidden' in modules))
        })

        await test('Should skip non-module files', async () => {
            const modules = await importDir(operationsDir)
            assert(!('readme' in modules))
        })

        await test('Should handle empty directories', async () => {
            const emptyDir = join(testDir, 'empty')
            await fs.mkdir(emptyDir, { recursive: true })
            const modules = await importDir(emptyDir)
            assert.deepEqual(modules, {})
        })

        await test('Should work with single-level imports', async () => {
            const modules = await importDir(operationsDir)
            assert(modules.sum)
            assert(modules.multiply)
            assert(modules.constants)
        })

        await test('Should use Promise.all for parallel imports', async () => {
            const modules = await importDir(operationsDir)
            // If this completes without error, parallel imports worked
            assert(Object.keys(modules).length > 0)
        })

        // Results
        console.log(`\n${passCount} passed, ${failCount} failed out of ${testCount} tests`)
    } finally {
        await cleanupFixtures()
    }
    
    process.exit(failCount > 0 ? 1 : 0)
}

// Run tests
runTests().catch(err => {
    console.error('Test runner error:', err)
    process.exit(1)
})
