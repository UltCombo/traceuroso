'use strict';

var compile = require('traceur').compile,
	path = require('path'),
	fs = require('fs'),
	Module = require('module'),
	previousRequireJs = Module._extensions['.js'],
	packages = {}, // packageRoot: compileOptions
	defaultOptions = traceur.util.Options.experimental().setFromObject({ modules: 'commonjs' });

Module._extensions['.js'] = function(module, filePath) {
	var options;
	if (Object.keys(packages).some(function(packageRoot) {
		if (filePath.startsWith(packageRoot + path.sep) && !filePath.startsWith(path.join(packageRoot, 'node_modules') + path.sep)) {
			options = packages[packageRoot];
			return true;
		}
	})) {
		return module._compile(compile(fs.readFileSync(filePath, { encoding: 'utf8' }), options), filePath);
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
	compileOptions = compileOptions || defaultOptions;

	packages[packageRoot] = compileOptions;
	return require(path.join(packageRoot, entryPoint));
};


// For testing only. Do not use, may be changed or removed anytime.
module.exports._reset = function() {
	packages = {};
};
module.exports._defaultOptions = defaultOptions;
