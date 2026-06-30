const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

class MakeExecutablePlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('MakeExecutablePlugin', () => {
            fs.chmodSync(path.resolve(__dirname, 'dist', 'index.js'), 0o755);
        });
    }
}

module.exports = {
    mode: 'production',
    target: 'node14',
    entry: path.resolve(__dirname, 'lib', 'cli.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            type: 'commonjs2'
        }
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new webpack.BannerPlugin({
            banner: '#!/usr/bin/env node',
            raw: true
        }),
        new MakeExecutablePlugin()
    ],
    resolve: {
        extensions: ['.js', '.json']
    }
};
