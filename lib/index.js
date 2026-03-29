import { promises as fs } from 'fs'

/**
 * importDirDynamic
 * Import modules dynamically from a given directory.
 *
 * @name importDirDynamic
 * @function
 * @param {String} dir The directory to import modules from.
 * @return {Object} An object containing the imported modules.
 */
export default async function importDirDynamic (dir) {
    const files = await fs.readdir(dir)
    const modules = {}

    for (const file of files) {
        const name = file.replace(/\.js$/, '')
        const path = `${dir}/${file}`
        const module = await import(path)
        modules[name] = module.default
    }

    return modules
}