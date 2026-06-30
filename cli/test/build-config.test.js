const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const packageJson = require('../package.json');

test('package publishes the bundled CLI entrypoint', () => {
    assert.equal(packageJson.scripts.build, 'webpack --config webpack.config.js');
    assert.equal(packageJson.scripts.prepack, 'npm run build');
    assert.match(packageJson.devDependencies.webpack, /^\^5\./);
    assert.match(packageJson.devDependencies['webpack-cli'], /^\^5\./);
    assert.deepEqual(packageJson.bin, {
        daxiapi: './dist/index.js',
        dxp: './dist/index.js'
    });
    assert.deepEqual(packageJson.files, ['dist', 'README.md']);
});

test('webpack config builds a Node CLI bundle with a shebang', () => {
    const config = require('../webpack.config.js');

    assert.equal(config.mode, 'production');
    assert.equal(config.target, 'node14');
    assert.equal(config.entry, path.resolve(__dirname, '..', 'lib', 'cli.js'));
    assert.equal(config.output.path, path.resolve(__dirname, '..', 'dist'));
    assert.equal(config.output.filename, 'index.js');
    assert.deepEqual(config.output.library, {type: 'commonjs2'});
    assert.equal(config.optimization.minimize, false);

    const bannerPlugin = config.plugins.find(plugin => plugin.constructor && plugin.constructor.name === 'BannerPlugin');
    assert.ok(bannerPlugin, 'expected a BannerPlugin');
    assert.equal(bannerPlugin.options.banner, '#!/usr/bin/env node');
    assert.equal(bannerPlugin.options.raw, true);

    assert.ok(
        config.plugins.some(plugin => plugin.constructor && plugin.constructor.name === 'MakeExecutablePlugin'),
        'expected a plugin that makes the bundled CLI executable'
    );
});
