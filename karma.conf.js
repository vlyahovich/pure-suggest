const webpackConfig = require('./webpack.config.js');

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        webpack: webpackConfig({}, {}),
        files: [
            'src/**/*.spec.ts'
        ],
        preprocessors: {
            'src/**/*.spec.ts': ['webpack']
        },
        mime: {
            'text/x-typescript': ['ts', 'tsx']
        },
        mode: 'development',
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true,
        concurrency: Infinity
    });
}