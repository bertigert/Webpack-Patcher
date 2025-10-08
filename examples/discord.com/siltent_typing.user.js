// ==UserScript==
// @name        Discord Silent Typing
// @description Hides that you are typing - PoC for WebpackPatcher
// @author      bertigert
// @version     1.0.0
// @icon        https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @namespace   WebpackPatcher
// @match       https://discord.com/*
// @grant       none
// @run-at      document-start
// ==/UserScript==


(function() {
    "use strict";

    class Logger {
        /**
         * @param {string} prefix - Prefix for all log messages
         * @param {boolean} debug - Enable debug logging
         */
        constructor(prefix, debug=false) {
            this.prefix = prefix;
            this.should_debug = debug;
        }

        debug(...args) {if (this.should_debug) console.debug(this.prefix, ...args);}
        log(...args) {console.log(this.prefix, ...args);}
        warn(...args) {console.warn(this.prefix, ...args);}
        error(...args) {console.error(this.prefix, ...args);}
    }
    const logger = new Logger("[Silent Typing]", true);

    function create_patch(name, data, functions, patches) {
        const patch = window.WebpackPatcher.register({
            name,
            data,
            functions
        }, patches);
        WebpackPatcher.addEventListener("webpack_detected", (wreq, modules) => {
            logger.log("Webpack detected", modules);
        });
        window.test_silenttype_enable = patch.functions.toggle;
    }

    const PATCHES = [
        {
            find: '.dispatch({type:"TYPING_START_LOCAL"',
            replacements: [
                {
                    match: /startTyping\(([a-z])\){(.+?)},stop/,
                    replace: (_, $1, $2) => { // this destroys the minified beauty of the code, but it's minified, so who cares
                        return `startTyping:(${$1}) => {
                            ${WebpackPatcher.placeholders.functions}.log("Silent typing enabled:", ${WebpackPatcher.placeholders.data}.enabled)
                            if (!${WebpackPatcher.placeholders.data}.enabled) {
                                ${$2}
                            }
                        },stop`;
                    }
                }
            ]
        }
    ];
    const data = {
        enabled: true
    };
    const functions = {
        log: logger.log.bind(logger),
        toggle: (enable) => {data.enabled = enable;}
    };

    (function wait_for_webpack_patcher() {
        if (window.WebpackPatcher) {
            logger.debug("Registering webpack patches");
            create_patch("Silent Typing", data, functions, PATCHES);
        } else if (!window.webpackChunkdiscord_app) {
            setTimeout(wait_for_webpack_patcher, 0);
        } else {
            logger.warn("Webpack array found, but not patcher, stopping");
        }
    })();

})();
