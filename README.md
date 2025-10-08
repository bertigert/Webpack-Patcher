# Webpack Patcher

This script is a runtime patching helper script for applications that use **Webpack** (e.g., Electron renderer processes or browser contexts).  
It allows you to intercept and modify webpack module code.

It works by hooking into webpack’s internal module system (`__webpack_require__`), intercepting the moment modules are defined and modifying their factory functions before they execute.

---


## Overview
Since this script patches modules before they are loaded/executed, it is necessary to initialize this script as early as possible.
That's why this is a standalone script and not a library or similar.

This also means that other scripts which utilize this script need to load and register patches as soon as possible. See example scripts for a way to do that.

## Global interface

After initialization, the following is exposed on `window.WebpackPatcher`:

| Property | Type | Description |
|-----------|------|-------------|
| `register(options, patches)` | `Function` | Registers patches. Returns the registrar object. |
| `addEventListener(event, callback)` | `Function` | Adds a listener for `webpack_detected`, `module_registered`, or `module_patched`. |
| `removeEventListener(event, callback)` | `Function` | Removes an event listener. |
| `webpackRequire` | `Function \| null` | The detected webpack require function. |
| `moduleFactories` | `Object \| null` | Map of all registered module factories. |
| `moduleCache` | `Object` | Wrapper for interacting with the webpack cache. |
| `patches` | `Array` | All patch configurations. |
| `patchedModules` | `Set` | IDs of modules that can be patched. |
| `isWebpackDetected` | `boolean` | True once webpack has been detected and hooked. |
| `Registrars` | `Object` | Registry of all user-defined patches. |
| `placeholders` | `Object` | Special placeholder values replaced in patched code. Used in replacements |
| `VERSION` | `number\|String` | Current patcher version. |

### Registrar system
The main entry point for a script is the `WebpackPatcher.register(options, patches)` function.

- `object` options - A simple centralized place for your script to store data:
    - `object` options.data - Place to store variables etc.
    - `object` options.functions - Place to store functions.

While it is not necessary for you to use the structure provided by the script, it's probably a good thing to use a standardized structure.

- `array` patches - The array of patches

This is the structure of a registration:
```js
WebpackPatcher.register_patches(
    { // options
        name: string, // required, creates/gets WebpackPatcher.Registrars[name]
        data: object, // initial data object for the registrar
        functions: object // initial functions object for the registrar
    },
    [ // patches
        {
            find: string | RegExp | Array<string|RegExp>, // substring or regex to match in module code
            replacements: [
                {
                    match: string | RegExp, // substring or regex to match
                    replace: string | Function, // replacement string or function (function receives same args as String.replace)
                    global: boolean // optional, default false, if true uses replaceAll
                }
            ]
        }
    ]
);
```

### Usage in other scripts
An easy way to use this script is the following:
```js
(function wait_for_webpack_patcher(){
    if (window.WebpackPatcher) {
        logger.debug("Registering webpack patches");
        window.WebpackPatcher.register({
            name: name
        }, PATCHES);
    } else if (!window.GLOBAL_WEBPACK_ARRAY) { // e.g. webpackChunkdiscord_app for discord.com
        setTimeout(wait_for_webpack_patcher, 0);
    } else {
        logger.warn("Webpack array found, but not patcher, stopping");
    }
})();
```
We wait for WebpackPatcher to be available, but stop if the global webpack array is found with WebpackPatcher still being unavailable. That's because if that case is true, then something broke in the Webpack Patcher.

## Modifying the script for other sites
The script is meant to be very easily ported to other sites. The only thing which should need changing is the `CONFIGURATIONS` array.

```js
/**
 * @param {Object} logger - Logger instance for debug/error output
 * @param {Object} options - Configuration options
 * @param {boolean} options.enable_cache - Enable caching for performance (default: false). Is only useful in some cases, check yourself.
 * @param {boolean} options.use_eval - Use eval instead of new Function for better debugging. Can be disabled by sites though. (default: true)
 * @param {Function} options.on_detect - Callback when webpack is detected (default: null)
 * @param {Function} options.filter_func - Filter function to select webpack instance: (webpack_require, stack_lines) => boolean. Should return true to allow the instance, false to reject it.
 * @param {Object} options.webpack_property_names - Property names to hook: {modules: "m", cache: "c"} (default: {modules: "m", cache: "c"})
*/
function initialize(logger, options={}) {}
```
The most important part is the filter_func. This should filter out the main webpack instance, the best way is to check for the caller's file. It should be the file which initializes the main part of webpack. Often has "web" or "runtime" in it's name.

## Examples
See the examples for different sites in [examples](./examples/).

## Officially supported sites
- https://deezer.com
- https://discord.com

### Credits
[Vencord Web](https://chromewebstore.google.com/detail/cbghhgpcnddeihccjmnadmkaejncjndb) - Inspiration on the hooking method