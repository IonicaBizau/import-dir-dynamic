import { promises as fs } from 'fs'

/**
 * importDirDynamic
 * Import modules dynamically from a given directory.
 *
 * @name importDirDynamic
 * @function
 * @param {String} dir The directory to import modules from. Supports `.js` and `.json` files. Recursively imports from subdirectories (excluding hidden ones).
 * @return {Object} An object containing the imported modules, with subdirectories as nested objects.
 */
export default async function importDirDynamic (dir) {
    const entries = await fs.readdir(dir)
    
    // Filter out hidden entries
    const visibleEntries = entries.filter(entry => !entry.startsWith('.'))
    
    // Stat all entries in parallel
    const statsPromises = visibleEntries.map(entry => {
        const path = `${dir}/${entry}`
        return fs.stat(path).then(stat => ({ entry, stat, path }))
    })
    const itemsWithStats = await Promise.all(statsPromises)
    
    // Process all imports in parallel
    const importPromises = itemsWithStats.map(async ({ entry, stat, path }) => {
        if (stat.isDirectory()) {
            return { key: entry, value: await importDirDynamic(path) }
        } else if (entry.endsWith('.js') || entry.endsWith('.json')) {
            const name = entry.replace(/\.(js|json)$/, '')
            const module = entry.endsWith('.json')
                ? await import(path, { with: { type: 'json' } })
                : await import(path)
            return { key: name, value: module.default }
        }
        return null
    })
    
    const results = await Promise.all(importPromises)
    const modules = {}
    results.forEach(result => {
        if (result) {
            modules[result.key] = result.value
        }
    })
    
    return modules
}