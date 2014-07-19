var path = require('path'),
	traceur = require('traceur');

module.exports = function(packageRoot, entryPoint) {
	packageRoot = path.resolve(packageRoot);
	entryPoint = entryPoint || 'index';

	traceur.require.makeDefault(function(filepath) {
		return filepath.startsWith(packageRoot + path.sep) && !filepath.startsWith(path.join(packageRoot, 'node_modules') + path.sep);
	}, { experimental: true });

	return require(path.join(packageRoot, entryPoint));
};
