# esbuild-tsc

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![CircleCI][circleci-image]][circleci-url]
[![Test Coverage][coveralls-image]][coveralls-url]


## About

An ESBuild plugin which uses tsc to compile typescript files

## Motivation

Esbuild natively supports typescript files, but not TypeScript decorators. 
TypeScript decorators are different from EcmaScript decorators. 
If TypeScript decorators are used in your project, tsc should be used to transpile.

## Installation

```sh
npm install --save-dev esbuild-tsc typescript
```

## Basic Usage

Add this plugin to your esbuild build script:

Typescript:
```ts
import esbuildPluginTsc from 'esbuild-tsc';

...
esbuild.build({
  ...
  plugins: [
    esbuildPluginTsc(options),
  ],
});
```

### Options

**_tsconfigPath [string] _**: Path of the tsconfig json file.
**_filter [RegExp | Function]_**: A RegExp or function to filter files.


[npm-image]: https://img.shields.io/npm/v/esbuild-tsc.svg
[npm-url]: https://npmjs.org/package/esbuild-tsc
[circleci-image]: https://circleci.com/gh/panates/esbuild-tsc/tree/master.svg?style=shield
[circleci-url]: https://circleci.com/gh/panates/esbuild-tsc/tree/master
[coveralls-image]: https://img.shields.io/coveralls/panates/esbuild-tsc/master.svg
[coveralls-url]: https://coveralls.io/r/panates/esbuild-tsc
[downloads-image]: https://img.shields.io/npm/dm/esbuild-tsc.svg
[downloads-url]: https://npmjs.org/package/esbuild-tsc
[gitter-image]: https://badges.gitter.im/panates/esbuild-tsc.svg
[gitter-url]: https://gitter.im/panates/esbuild-tsc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[dependencies-image]: https://david-dm.org/panates/esbuild-tsc/status.svg
[dependencies-url]:https://david-dm.org/panates/esbuild-tsc
[devdependencies-image]: https://david-dm.org/panates/esbuild-tsc/dev-status.svg
[devdependencies-url]:https://david-dm.org/panates/esbuild-tsc?type=dev
[quality-image]: http://npm.packagequality.com/shield/esbuild-tsc.png
[quality-url]: http://packagequality.com/#?package=esbuild-tsc
