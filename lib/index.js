import { promises as fs } from 'fs'

/**
 * importDirDynamic
 * Import modules dynamically from a given directory.
 *
 * @name importDirDynamic
 * @function
 * @param {String} dir The directory to import modules from. Supports `.js` and `.json` files.
 * @return {Object} An object containing the imported modules.
 */
export default async function importDirDynamic (dir) {
    const files = await fs.readdir(dir)
    const modules = {}

    for (const file of files) {
        if (!file.endsWith('.js') && !file.endsWith('.json')) {
            continue
        }

        const name = file.replace(/\.(js|json)$/, '')
        const path = `${dir}/${file}`
        const module = file.endsWith('.json')
            ? await import(path, { with: { type: 'json' } })
            : await import(path)
        modules[name] = module.default
    }

    return modules
}