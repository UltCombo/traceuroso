global._traceuroso = global._traceuroso || {};

// Only load a single Traceur singleton, see https://github.com/google/traceur-compiler/issues/1209#issue-38851768
var requireMakeDefault = _traceuroso.requireMakeDefault = _traceuroso.requireMakeDefault || require('traceur').require.makeDefault,
	path = require('path');

module.exports = function(packageRoot, entryPoint) {
	packageRoot = path.resolve(packageRoot);
	entryPoint = entryPoint || 'index';

	requireMakeDefault(function(filepath) {
		return filepath.startsWith(packageRoot + path.sep) && !filepath.startsWith(path.join(packageRoot, 'node_modules') + path.sep);
	}, { experimental: true });

	return require(path.join(packageRoot, entryPoint));
};
