## Documentation

You can see below the API reference of this module.

### `importDirDynamic(dir, [options])`
Import modules dynamically from a given directory.

#### Params

- **String** `dir`: The directory to import modules from. Supports `.js` and `.json` files. Recursively imports from subdirectories (excluding hidden ones).
- **Object** `[options]`: Optional settings for the import process.    - `defaultOnly` (boolean): If true, only the default export of each module will be included in the result. Defaults to true.

#### Return
- **Object** An object containing the imported modules, with subdirectories as nested objects.

