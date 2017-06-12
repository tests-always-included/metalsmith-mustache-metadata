Changelog
=========


1.1.0 - 2017-06-12
------------------

* Moved to start using metalsmith-plugin-kit.
* Improved documentation.


1.0.3 - 2016-12-27
------------------

* Sets `_parent?`, which was omitted earlier.
* Making sure that `_parent?` overrides any existing `_parent?` setting.


1.0.2 - 2016-12-23
------------------

* Made the plugin safe to run twice over the same data.
* Forced all file objects to have a null `_parent` property.


1.0.1 - 2016-12-21
------------------

* Found another loop condition.  Eliminating the bug and added tests.


1.0.0 - 2016-12-19
------------------

* Initial release.
