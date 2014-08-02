var traceuroso = require('../'),
	path = require('path'),
	fs = require('fs'),
	mkdirp = require('mkdirp');
require('should');

var fixPath = path.join(__dirname, 'fixtures');

var toUnlink = [];
before(function() {
	[
		['es_next-1', 'index.js'],
		['es_next-1', 'other.js'],
		['es_next-2', 'index.js'],
	].forEach(function(pathSegments) {
		var targetPath = path.join.apply(path, [fixPath, 'node_modules'].concat(pathSegments));
		mkdirp.sync(path.dirname(targetPath));
		fs.writeFileSync(targetPath, fs.readFileSync(path.join(fixPath, 'es_next.js')));
		toUnlink.push(targetPath);
	});
});

after(toUnlink.forEach.bind(toUnlink, fs.unlinkSync));


describe('traceuroso', function() {

	beforeEach(function() {
		// empty the module cache
		Object.keys(require.cache).forEach(function(filePath) {
			delete require.cache[filePath];
		});

		disableRequireProxy(traceuroso);
	});

	function disableRequireProxy(traceuroso) {
		// The first makeDefault() call with no arguments empties the filters list,
		// the second call adds a filter which always returns false.
		// This is necessary because the current require() proxy implementation
		// will traceur the required file if there are no filters or if any filter returns true.
		// makeDefault() implementation: https://github.com/google/traceur-compiler/blob/master/src/node/require.js
		traceuroso._requireMakeDefault();
		traceuroso._requireMakeDefault(function() {
			return false;
		});
	}

	it('should throw on ES.next code without traceuroso', function() {
		require.bind(null, path.join(fixPath, 'es_next')).should.throw();
	});

	it('should run ES.next code with traceuroso', function() {
		traceuroso(fixPath, 'es_next').exports.should.be.ok;
	});

	it('should transpile and execute the default entry point (index.js)', function() {
		traceuroso(fixPath).index.should.be.ok;
	});

	it('should transpile and execute a custom entry point', function() {
		traceuroso(fixPath, 'x').x.should.equal('x');
	});

	it('should transpile and execute imported files', function() {
		traceuroso(fixPath, 're-export_x').x.should.equal('x');
	});

	it('should not transpile dependencies', function() {
		traceuroso(fixPath, 'require_non-strict').should.have.property('a');
	});

	it('should handle non-normalized paths and inconsistent directory separators', function() {
		// Note: forward slashes on Windows are part of this test, do not replace them with path.join()
		traceuroso(fixPath + '/node_modules/../.', 'node_modules/../x').x.should.equal('x');
	});

	it('should work when used as a dependency of multiple packages', function() {
		// traceurosofy package 1
		traceuroso(path.join(fixPath, 'node_modules', 'es_next-1'));

		// Simulate package 2 require()ing an uncached traceuroso module,
		// as if it had its own traceuroso package installed inside its node_modules directory.
		// Note: this works as the module caching has been emptied in beforeEach()
		var traceuroso2 = require('../');
		traceuroso.should.not.equal(traceuroso2);

		// traceurosofy package 2
		traceuroso2(path.join(fixPath, 'node_modules', 'es_next-2'));

		// should still be able to require() ES.next files in package 1
		require(path.join(fixPath, 'node_modules', 'es_next-1', 'other')).exports.should.be.ok;

		// Test finished, clean up
		disableRequireProxy(traceuroso2);
	});
});
