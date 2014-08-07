'use strict';

var compile = require('traceur').compile,
	path = require('path'),
	fs = require('fs'),
	Module = require('module'),
	previousRequireJs = Module._extensions['.js'],
	packages = {}, // packageRoot: compileOptions
	compileErrPrefix = 'traceuroso: traceur.compile error: ';

Module._extensions['.js'] = function(module, filePath) {
	var options;
	if (Object.keys(packages).some(function(packageRoot) {
		if (filePath.startsWith(packageRoot + path.sep) && !filePath.startsWith(path.join(packageRoot, 'node_modules') + path.sep)) {
			options = packages[packageRoot];
			return true;
		}
	})) {
		var results = compile(fs.readFileSync(filePath, { encoding: 'utf8' }), options);
		if (!results.js) {
			throw new Error(compileErrPrefix + results.errors[0]);
		}
		return module._compile(results.js, filePath);
	}
	return previousRequireJs(module, filePath);
};

module.exports = function(packageRoot, entryPoint, compileOptions) {
	packageRoot = path.resolve(packageRoot);
	if ({}.toString.call(entryPoint) === '[object Object]') {
		compileOptions = entryPoint;
		entryPoint = undefined;
	}
	entryPoint = entryPoint || 'index';
	compileOptions = compileOptions || { experimental: true };

	packages[packageRoot] = compileOptions;
	return require(path.join(packageRoot, entryPoint));
};


// For testing only. Do not use, may be changed or removed anytime.
module.exports._reset = function() {
	packages = {};
};
module.exports._compileErrPrefix = compileErrPrefix;
