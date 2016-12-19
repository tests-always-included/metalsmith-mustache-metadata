"use strict";

var plugin;

plugin = require("..");

/**
 * Kick off the plugin and send it a list of files.
 *
 * This is far easier because the entire plugin is synchronous.
 *
 * @param {Object} [files={}]
 * @param {Object} [config]
 * @return {Object} modified files
 */
function runPlugin(files, config) {
    if (!files) {
        files = {};
    }

    // Convert everything to Buffer objects
    Object.keys(files).forEach(function (file) {
        var contents;

        contents = files[file].contents || "";
        files[file].contents = Buffer.from(contents, "utf8");
    });

    // The plugin ignores the metalsmith object and is synchronous,
    // so the "done" callback doesn't need to do anything.
    plugin(config)(files, {}, function () {});

    // Convert everything to strings for easy comparisons
    Object.keys(files).forEach(function (file) {
        files[file].contents = files[file].contents.toString("utf8");
    });

    return files;
}

describe("metalsmith-mustache-metadata", function () {
    it("does not break with no files", function () {
        var files;

        files = runPlugin();
        expect(files).toEqual({});
    });
    it("matches expected files by default", function () {
        var files;

        files = {
            "folder/test.html": {
                contents: ""
            },
            "folder2/skip.css": {
                contents: ""
            },
            "another-test.htm": {
                contents: ""
            }
        };
        runPlugin(files);
        expect(files["folder/test.html"]["contents?"]).toEqual(files["folder/test.html"]);
        expect(files["another-test.htm"]["contents?"]).toEqual(files["folder/test.html"]);
        expect(files["folder2/skip.css"]["contents?"]).not.toBeDefined();
    });
    it("matches files when configured by options", function () {
        var files;

        files = {
            "folder/test.html": {
                contents: ""
            },
            "folder2/skip.css": {
                contents: ""
            },
            "another-test.htm": {
                contents: ""
            }
        };
        runPlugin(files, {
            match: "**/*.css"
        });
        expect(files["folder/test.html"]["contents?"]).not.toBeDefined();
        expect(files["another-test.htm"]["contents?"]).not.toBeDefined();
        expect(files["folder2/skip.css"]["contents?"]).toEqual(files["folder2/skip.css"]);
    });
    describe("object modification", function () {
        var files;

        beforeEach(function () {
            files = {
                buffer: {
                    contents: Buffer.from("test", "utf8")
                },
                loop: {
                },
                propName: {
                    array: [],
                    emptyString: "",
                    false: false,
                    null: null,
                    object: {},
                    one: 1,
                    string: "abc",
                    true: true,
                    zero: 0
                },
                parent: {
                    array: [
                        "one",
                        "two"
                    ],
                    object: {
                        one: "one",
                        two: "two"
                    }
                }
            };
            files.loop.myself = files.loop;
            runPlugin(files, {
                match: "**/*"
            });
        });
        it("skips delving into buffers", function () {
            /* eslint no-underscore-dangle:off */
            expect(files.buffer.contents._parent).not.toBeDefined();
        });
        it("avoids loops", function () {
            // Well, if it looped then this test would never execute!
            expect(files.loop.myself).toBe(files.loop);
        });
        it("adds propName? for truthy", function () {
            expect(files.propName["array?"]).toBe(files.propName);
            expect(files.propName["object?"]).toBe(files.propName);
            expect(files.propName["one?"]).toBe(files.propName);
            expect(files.propName["string?"]).toBe(files.propName);
            expect(files.propName["true?"]).toBe(files.propName);
        });
        it("skips propName? for falsy", function () {
            expect(files.propName["emtpyString?"]).not.toBeDefined();
            expect(files.propName["false?"]).not.toBeDefined();
            expect(files.propName["null?"]).not.toBeDefined();
            expect(files.propName["zero?"]).not.toBeDefined();
        });
        it("adds _parent and propName? to Objects", function () {
            expect(files.parent.object._parent).toBe(files.parent);
            expect(files.parent.object["one?"]).toBe(files.parent.object);
            expect(files.parent.object["two?"]).toBe(files.parent.object);
        });
        it("adds _parent to Arrays", function () {
            expect(files.parent.array._parent).toBe(files.parent);
        });
    });
});
