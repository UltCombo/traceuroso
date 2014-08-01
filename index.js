var requireMakeDefault = require('traceur').require.makeDefault,
	path = require('path');

module.exports = function(packageRoot, entryPoint) {
	packageRoot = path.resolve(packageRoot);
	entryPoint = entryPoint || 'index';

	requireMakeDefault(function(filepath) {
		return filepath.startsWith(packageRoot + path.sep) && !filepath.startsWith(path.join(packageRoot, 'node_modules') + path.sep);
	}, { experimental: true });

	return require(path.join(packageRoot, entryPoint));
};


// For testing only. Do not use, may be changed or removed anytime.
module.exports._requireMakeDefault = requireMakeDefault;
