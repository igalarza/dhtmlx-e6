
var nodeResolve = require('rollup-plugin-node-resolve');
var includePaths = require('rollup-plugin-includepaths');
var babel = require('rollup-plugin-babel');
var istanbul = require('rollup-plugin-istanbul');

module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
		'vendor/dhtmlx.max.js',
		{ pattern: 'src/**/*.js', included: false },
		'test/**/*.spec.js',
		// css files are required for size validations
		'vendor/dhtmlx.css',
		'test/main.css',
    ],
	
	// coverage reporter generates the coverage
    reporters: ['progress', 'coverage'],
	
	preprocessors: {
		'src/**/*.js': ['rollup'],
        'test/**/*.spec.js': ['rollup']
    },
	
	rollupPreprocessor: {
		entry: './src/main.js',
		context: 'window',	
		format: 'iife',           
        moduleName: 'dhtmlx-e6', 
		sourceMap: 'inline',
		plugins: [
			includePaths({
				include: {},
				paths: ['src/'],
				external: [],
				extensions: ['.js', '.json']
			}),
			istanbul({
                exclude: ['test/**/*.js']
            }),
			babel({
				presets: [["es2015", { "modules": false }]],
				plugins: ["external-helpers"]
			})		
		]       
    }
  });
};