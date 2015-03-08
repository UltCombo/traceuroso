# DEPRECATED

This package has been deprecated in favor of [slush-es20xx](https://github.com/es6rocks/slush-es20xx), which provides a better, full ECMAScript.next development and deployment workflow.

# traceuroso
[![npm version](http://img.shields.io/npm/v/traceuroso.svg)](https://npmjs.org/package/traceuroso)
[![Build Status](http://img.shields.io/travis/UltCombo/traceuroso.svg)](https://travis-ci.org/UltCombo/traceuroso)
[![Dependency Status](http://img.shields.io/david/UltCombo/traceuroso.svg)](https://david-dm.org/UltCombo/traceuroso)
[![devDependency Status](http://img.shields.io/david/dev/UltCombo/traceuroso.svg)](https://david-dm.org/UltCombo/traceuroso#info=devDependencies)

Write and run ECMAScript.next Node.js packages without any build steps.

# Purpose

- **ECMAScript.next**: make use of the next generation JavaScript features today through the quantum time travelling magic of [Traceur](https://github.com/google/traceur-compiler).
- **Modularity**: traceuroso is enabled per package, thus it does not conflict with your package's dependencies nor packages which depend upon your package.
- **No build steps**: there is no transpiling between editing and running your code, thus providing a faster development workflow and cleaner source control, testing and deployment.

# Install

```
npm install --save traceuroso
```

# Usage

Create a traceuroso bootstrapping file and set it as your package's entry point. Here is a quick overview:

package.json

```js
"main": "bootstrap.js"
```

bootstrap.js

```js
module.exports = require('traceuroso')(__dirname, 'index');
```

index.js

```js
// Just write your ES.next code naturally =]
let my = ((awesome, es6) => 'code')('shine!');
```

See the API section below for details.

# API

```js
entryPointExports = traceuroso(packageRoot[, entryPoint='index'][, compileOptions=traceur.util.Options.experimental().setFromObject({ modules: 'commonjs' })])
```

- `packageRoot` (string): the root directory of the package to traceurosofy. All `.js` files inside of `packageRoot`, except those inside of `packageRoot`'s `node_modules` directory, will be compiled using Traceur when `require()`d or `import`ed.
- `entryPoint` (string, optional): the file path to your package's main file (your `package.json`'s original `main` file), relative to `packageRoot`. Defaults to `index`.
- `compileOptions` (object, optional): the options passed to the Traceur compiler. See Traceur's [Options.js](https://github.com/google/traceur-compiler/blob/master/src/Options.js) for available options and values. Useful for parsing ES.next semantics without applying transformations (e.g. `{ blockBinding: 'parse' }` for usage with the Node.js `--harmony` flag). Defaults to all options enabled by default plus all experimental options enabled.
- *returns*: `entryPoint`'s exports. You should re-export these in order to make them available to the files which `require()` your package.

# The traceuroso bootstrapping file

The bootstrapping file is the first file to be executed when your package is required. It is responsible for loading Traceur, compiling and running your package, as well as re-exporting your package's exports. Review the Usage and API sections for example and details.

Note that as the bootstrapping file is `require()`'d and executed directly by Node.js before the package is traceurosofied, the bootstrapping file must contain only valid Node.js code that can run without Traceur's aid.

# Optimization

In order to avoid loading the Traceur compiler multiple times, it is recommended to run [`npm dedupe traceuroso`](https://www.npmjs.org/doc/cli/npm-dedupe.html) in the downstream package, or install traceuroso in the downstream package before installing the other dependencies.

# Changelog

- **0.0.6**: set a more specific Traceur version dependency in `package.json`.
- **0.0.5**: updated the internal Traceur API usage to work with the latest Traceur version (v0.0.86 at the time of publishing), improved compilation error stack trace, bumped dependencies, deprecated traceuroso in favor of slush-es20xx.
- **0.0.4**: added optimization section to documentation, improved source code readability.
- **0.0.3**: added `compileOptions` parameter, replaced `traceur.require.makeDefault()` with own implementation.
- **0.0.2**: no longer version locks Traceur, added full test coverage, documentation improvements.
- **0.0.1**: initial release.
