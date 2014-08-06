var traceuroso = require('../'),
	path = require('path'),
	fs = require('fs'),
	mkdirp = require('mkdirp');
require('should');

var fixPath = path.join(__dirname, 'fixtures'),
	compileErrReg = RegExp('^' + traceuroso._compileErrPrefix.replace(/\W/g, '\\$&'));

var toUnlink = [];
before(function() {
	var esNextCode = fs.readFileSync(path.join(fixPath, 'es_next.js'));
	[
		['es_next-1', 'index.js'],
		['es_next-1', 'other.js'],
		['es_next-2', 'index.js'],
	].forEach(function(pathSegments) {
		var targetPath = path.join.apply(path, [fixPath, 'node_modules'].concat(pathSegments));
		mkdirp.sync(path.dirname(targetPath));
		fs.writeFileSync(targetPath, esNextCode);
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

		traceuroso._reset();
	});

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

	it('should set the compiler options', function() {
		// tests traceuroso(packageRoot, compileOptions) and traceuroso(packageRoot, entryPoint, compileOptions)
		[[], 'other.js'].forEach(function(entryPoint) {
			var curriedTraceuroso = traceuroso.bind.apply(traceuroso, [traceuroso, path.join(fixPath, 'node_modules', 'es_next-1')].concat(entryPoint));
			curriedTraceuroso.bind(curriedTraceuroso, {}).should.throw(compileErrReg);
			traceuroso._reset();
			curriedTraceuroso({ experimental: true }).exports.should.be.ok;
			traceuroso._reset();
		});
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

	it('Modularity: packageRoot filters', function() {
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
		traceuroso2._reset();
	});

	it('Modularity: compileOptions', function() {
		traceuroso(path.join(fixPath, 'node_modules', 'es_next-1'), { experimental: true });

		var traceuroso2 = require('../');
		traceuroso.should.not.equal(traceuroso2);

		traceuroso2.bind(traceuroso2, path.join(fixPath, 'node_modules', 'es_next-2'), {}).should.throw(compileErrReg);

		// should handle multiple packages per traceuroso instance
		traceuroso(fixPath, {}).index.should.be.ok;

		// should use the compileOptions associated with the given packageRoot
		require(path.join(fixPath, 'node_modules', 'es_next-1', 'other')).exports.should.be.ok;
		require.bind(null, path.join(fixPath, 'node_modules', 'es_next-2')).should.throw(compileErrReg);
		require.bind(null, path.join(fixPath, 'es_next')).should.throw(compileErrReg);

		// clean up
		traceuroso2._reset();
	});
});
