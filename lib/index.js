/**
 * Metalsmith Mustache Metadata adds references in the metadata and additional
 * properties that make it easier to work with Mustache templates. Typically
 * you can not test for the presence or absense of a value in Mustache
 * templates, which is by design. This allows you to cheat a bit and insert
 * a minor amount of logic in templates, such as "does X exist".
 *
 * @module metalsmith-mustache-metadata
 */
"use strict";

/**
 * Metalsmith's file object.
 *
 * @typedef {Object} metalsmithFile
 * @property {Buffer} contents
 * @property {string} mode
 */

/**
 * Metalsmith's collection of files.
 *
 * @typedef {Object.<string,module:metalsmith-mustache-metadata~metalsmithFile>} metalsmithFileCollection
 */

var pluginKit;

pluginKit = require("metalsmith-plugin-kit");

/**
 * Options that can be passed to the middleware factory.
 *
 * @typedef {Object} options
 * @param {module:metalsmith-plugin-kit~matchList} [match] Defaults to all files
 * @param {module:metalsmith-plugin-kit~matchOptions} [matchOptions={}] Options for matching files.
 * @see {@link https://github.com/fidian/metalsmith-plugin-kit}
 */

/**
 * Factory to build middleware for Metalsmith.
 *
 * @param {module:metalsmith-mustache-metadata~options} options
 * @return {Function}
 */
module.exports = (options) => {
    /**
     * Adds the _parent property to all objects.
     *
     * @param {Object} thing Can also include Array objects.
     * @param {(Object|null)} parent `null` if no parent.
     * @param {boolean} forceUpdate Overwrites if _parent already exists
     */
    function update(thing, parent, forceUpdate) {
        var i, key, keys, val;

        // Avoid if the _parent property is set, regardless if we were
        // the ones that set it or not.
        if (thing.hasOwnProperty("_parent")) {
            if (!forceUpdate) {
                return;
            }

            // eslint-disable-next-line no-underscore-dangle
            delete thing._parent;
        }

        // eslint-disable-next-line no-underscore-dangle
        thing._parent = parent;

        if (!parent && thing["_parent?"]) {
            delete thing["_parent?"];
        }

        keys = Object.keys(thing);

        for (i = 0; i < keys.length; i += 1) {
            key = keys[i];
            val = thing[key];

            if (key.charAt(key.length - 1) !== "?" && val) {
                thing[`${key}?`] = thing;

                if (typeof val === "object" && !Buffer.isBuffer(val)) {
                    update(val, thing);
                }
            }
        }
    }

    options = pluginKit.defaultOptions({
        match: "**/*.{html,htm}",
        matchOptions: {}
    }, options);

    return pluginKit.middleware({
        each: (filename, file) => {
            update(file, null, true);
        },
        match: options.match,
        matchOptions: options.matchOptions,
        name: "metalsmith-mustache-metadata"
    });
};
