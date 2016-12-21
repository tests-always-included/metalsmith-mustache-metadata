"use strict";

var minimatch;

minimatch = require("minimatch");

/**
 * Factory to build middleware for Metalsmith.
 *
 * @param {Object} options
 * @return {Function}
 */
module.exports = function (options) {
    var matcher;

    /**
     * Adds the _parent property to all objects.
     *
     * @param {Object} thing Can also include Array objects.
     * @param {Object} [parent]
     */
    function update(thing, parent) {
        var i, key, keys, val;

        /* eslint no-underscore-dangle:off */
        // Avoid if the _parent property is set, regardless if we were
        // the ones that set it or not.
        if (thing._parent) {
            return;
        }

        keys = Object.keys(thing);
        thing._parent = parent;

        for (i = 0; i < keys.length; i += 1) {
            key = keys[i];
            val = thing[key];

            if (val) {
                thing[key + "?"] = thing;

                if (typeof val === "object" && !Buffer.isBuffer(val)) {
                    update(val, thing);
                }
            }
        }
    }

    options = options || {};
    options.match = options.match || "**/*.{html,htm}";
    options.matchOptions = options.matchOptions || {};
    matcher = new minimatch.Minimatch(options.match, options.matchOptions);

    /**
     * Middleware function.
     *
     * @param {Object} files
     * @param {Object} metalsmith
     * @param {Function} done
     */
    return function (files, metalsmith, done) {
        Object.keys(files).forEach(function (file) {
            if (matcher.match(file)) {
                update(files[file]);
            }
        });
        done();
    };
};
