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
 * @return {Promise.<Object>} modified files
 */
function runPlugin(files, config) {
    if (!files) {
        files = {};
    }

    // Convert everything to Buffer objects
    Object.keys(files).forEach((file) => {
        var contents;

        contents = files[file].contents || "";
        files[file].contents = Buffer.from(contents, "utf8");
    });

    return new Promise((resolve, reject) => {
        plugin(config)(files, {}, (err) => {
            if (err) {
                reject(err);
            } else {
                // Convert everything to strings for easy comparisons
                Object.keys(files).forEach((file) => {
                    files[file].contents = files[file].contents.toString("utf8");
                });
                resolve(files);
            }
        });
    });
}

describe("metalsmith-mustache-metadata", () => {
    it("does not break with no files", () => {
        return runPlugin().then((files) => {
            expect(files).toEqual({});
        });
    });
    it("matches expected files by default", () => {
        return runPlugin({
            "folder/test.html": {
                contents: ":: one ::"
            },
            "folder2/skip.css": {
                contents: ":: two ::"
            },
            "another-test.htm": {
                contents: ":: three ::"
            }
        }).then((files) => {
            expect(files["folder/test.html"]["contents?"]).toEqual(files["folder/test.html"]);
            expect(files["another-test.htm"]["contents?"]).toEqual(files["another-test.htm"]);
            expect(files["folder2/skip.css"]["contents?"]).not.toBeDefined();
        });
    });
    it("sets up _parent and _parent?", () => {
        return runPlugin({
            "index.html": {
                contents: ":: one ::",
                "_parent?": true,
                someObject: {
                    "_parent?": true
                }
            }
        }).then((files) => {
            expect(files["index.html"]._parent).toBe(null);
            expect(files["index.html"]["_parent?"]).not.toBeDefined();
            expect(files["index.html"].someObject._parent).toBe(files["index.html"]);
            expect(files["index.html"].someObject["_parent?"]).toBe(files["index.html"].someObject);
        });
    });
    it("matches files when configured by options", () => {
        return runPlugin({
            "folder/test.html": {
                contents: ":: one ::"
            },
            "folder2/skip.css": {
                contents: ":: two ::"
            },
            "another-test.htm": {
                contents: ":: three ::"
            }
        }, {
            match: "**/*.css"
        }).then((files) => {
            expect(files["folder/test.html"]["contents?"]).not.toBeDefined();
            expect(files["another-test.htm"]["contents?"]).not.toBeDefined();
            expect(files["folder2/skip.css"]["contents?"]).toEqual(files["folder2/skip.css"]);
        });
    });
    describe("object modification", () => {
        var files;

        beforeEach(() => {
            files = {
                buffer: {
                    contents: Buffer.from("test", "utf8")
                },
                loop: {},
                loop2: {
                    anotherObject: {}
                },
                linkingChild: {
                    ancestry: {}
                },
                linkingParent: {
                    ancestry: {
                        children: []
                    }
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
                },
                safeTwice: {
                    _parent: null,
                    true: true
                }
            };

            // Look for self-referential things
            files.loop.myself = files.loop;

            // Look for loops back to a parent
            files.loop2.anotherObject.myself = files.loop2;

            // Avoid scenarios where one fileObject can link to another.
            files.linkingParent.ancestry.children.push(files.linkingChild);
            files.linkingChild.ancestry.parent = files.linkingParent;

            // Simulate running the plugin on `safeTwice`.
            files.safeTwice["true?"] = files.safeTwice;

            // Make the magic happen
            return runPlugin(files, {
                match: "**/*"
            });
        });
        it("skips delving into buffers", () => {
            /* eslint no-underscore-dangle:off */
            expect(files.buffer.contents._parent).not.toBeDefined();
        });
        it("avoids loops", () => {
            // Well, if it looped then this test would never execute!
            expect(files.loop.myself).toBe(files.loop);
        });
        it("makes sure each root file object has a null _parent", () => {
            expect(files.linkingParent._parent).toBe(null);
            expect(files.linkingChild._parent).toBe(null);
        });
        it("adds propName? for truthy", () => {
            expect(files.propName["array?"]).toBe(files.propName);
            expect(files.propName["object?"]).toBe(files.propName);
            expect(files.propName["one?"]).toBe(files.propName);
            expect(files.propName["string?"]).toBe(files.propName);
            expect(files.propName["true?"]).toBe(files.propName);
        });
        it("skips propName? for falsy", () => {
            expect(files.propName["emtpyString?"]).not.toBeDefined();
            expect(files.propName["false?"]).not.toBeDefined();
            expect(files.propName["null?"]).not.toBeDefined();
            expect(files.propName["zero?"]).not.toBeDefined();
        });
        it("adds _parent and propName? to Objects", () => {
            expect(files.parent.object._parent).toBe(files.parent);
            expect(files.parent.object["one?"]).toBe(files.parent.object);
            expect(files.parent.object["two?"]).toBe(files.parent.object);
        });
        it("adds _parent to Arrays", () => {
            expect(files.parent.array._parent).toBe(files.parent);
        });
        it("has normal behavior if ran twice", () => {
            expect(files.safeTwice["true?"]).toBe(files.safeTwice);
            expect(files.safeTwice["true??"]).not.toBeDefined();
            expect(files.parent.array._parent).toBe(files.parent);
        });
    });
});
