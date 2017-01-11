metalsmith-mustache-metadata
============================

Metalsmith plugin to modify file metadata to make it easier to work with [Mustache] templates.

[![npm version][npm-badge]][npm-link]
[![Build Status][travis-badge]][travis-link]
[![Dependencies][dependencies-badge]][dependencies-link]
[![Dev Dependencies][devdependencies-badge]][devdependencies-link]
[![codecov.io][codecov-badge]][codecov-link]


What It Does
------------

This plugin adds a bunch of properties to objects in order to assist you when working with more complex Mustache templates.  For instance, sometimes you get a data structure like this:

    {
        "module": "something",
        "rootPath": "../../",
        "scripts": [
            "js/first.js",
            "js/second.js"
        ],
        "user": {
            "first": "Tyler"
            "last": "Akins"
        }
    }

Your template wants to use the `module` property and trigger behavior.

    {{#module}}
    <script src="{{rootPath}}js/super-library.js"></script>
    {{/module}}
    {{#scripts}}
    <script src="{{rootPath}}{{.}}</script>
    {{/script}}

Unfortunately, that does not work in Mustache templates because context is switched to the `module` property and you lose access to all things in the parent.  Fret no longer!  This plugin adds links throughout the metadata allowing you to determine if a value is set and also to go back to parents.  The structure will end up looking somewhat like this:

    {
        "module": "something",
        "module?": { *pointer to root object* },
        "rootPath": "../../",
        "rootPath?": { *pointer to root object* },
        "templates": [
            "first",
            "second",
            /* Additional properties added */
            "_parent": { *pointer to root object* }
        ],
        "user": {
            "first": "Tyler",
            "first?": { *pointer to user object* },
            "last": "Akins",
            "last?": { *pointer to user object* },
            "_parent": { *pointer to root object* }
        }
    }

This allows you to use the following syntax in your templates.  You can also navigate up to parent objects and accomplish all sorts of amazing things in Mustache.

    {{#module?}}
    <script src="{{rootPath}}js/super-library.js"></script>
    {{/module?}}
    {{#scripts}}
    <script src="{{_parent.rootPath}}{{.}}</script>
    {{/script}}


Installation
------------

`npm` can do this for you.

    npm install --save-dev metalsmith-mustache-metadata


Usage
-----

Include this like you would include any other plugin.  Here is the CLI example with the default options.  You don't need to specify any options unless you want to change their values.

    {
        "plugins": {
            "metalsmith-mustache-metadata": {
                "match": "**/*.{htm,html}",
                "matchOptions": {}
            }
        }
    }

And here is the JavaScript example.  It also includes brief descriptions of each option.

    // Load this, just like other plugins.
    var mustacheMetadata = require("metalsmith-mustache-metadata");

    // Then in your list of plugins you use it.
    .use(mustacheMetadata())

    // Alternately, you can specify options.  The values shown here are
    // the defaults.
    .use(mustacheMetadata({
        // Pattern of files to match
        match: "**/*.{htm,html}",

        // Options for matching files.  See minimatch.
        matchOptions: {}
    })

This uses [minimatch] to match files.  The `.matchOptions` object can be filled with options that the [minimatch] library uses.


Development
-----------

This uses Jasmine, Istanbul and ESLint for tests.

    # Install all of the dependencies
    npm install

    # Run the tests
    npm run test

This plugin is licensed under the [MIT License][License] with an additional non-advertising clause.  See the [full license text][License] for information.


[codecov-badge]: https://img.shields.io/codecov/c/github/tests-always-included/metalsmith-mustache-metadata/master.svg
[codecov-link]: https://codecov.io/github/tests-always-included/metalsmith-mustache-metadata?branch=master
[dependencies-badge]: https://img.shields.io/david/tests-always-included/metalsmith-mustache-metadata.svg
[dependencies-link]: https://david-dm.org/tests-always-included/metalsmith-mustache-metadata
[devdependencies-badge]: https://img.shields.io/david/dev/tests-always-included/metalsmith-mustache-metadata.svg
[devdependencies-link]: https://david-dm.org/tests-always-included/metalsmith-mustache-metadata#info=devDependencies
[License]: LICENSE.md
[minimatch]: https://github.com/isaacs/minimatch
[Mustache]: https://mustache.github.io/
[npm-badge]: https://img.shields.io/npm/v/metalsmith-mustache-metadata.svg
[npm-link]: https://npmjs.org/package/metalsmith-mustache-metadata
[travis-badge]: https://img.shields.io/travis/tests-always-included/metalsmith-mustache-metadata/master.svg
[travis-link]: http://travis-ci.org/tests-always-included/metalsmith-mustache-metadata
