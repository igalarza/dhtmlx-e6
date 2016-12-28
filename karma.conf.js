
var nodeResolve = require('rollup-plugin-node-resolve');
var includePaths = require('rollup-plugin-includepaths');
var babel = require('rollup-plugin-babel');

module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
		'vendor/dhtmlx.js',
		{ pattern: 'src/**/*.js', included: false },
		'test/**/*.spec.js'
    ],
	preprocessors: {
		'src/**/*.js': ['rollup'],
        'test/**/*.spec.js': ['rollup'],
    },
	rollupPreprocessor: {
		format: 'cjs',
		context: 'window',
		sourceMap: 'inline',
		plugins: [
			includePaths({
				include: {},
				paths: ['src/'],
				external: [],
				extensions: ['.js', '.json']
			}),
			babel({
				presets: [["es2015", { "modules": false }]],
				plugins: ["external-helpers"]
			})		
		]       
    }
  });
};