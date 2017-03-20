
var nodeResolve = require('rollup-plugin-node-resolve');
var includePaths = require('rollup-plugin-includepaths');
var babel = require('rollup-plugin-babel');
var istanbul = require('rollup-plugin-istanbul');

module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
		{ pattern: 'vendor/dhtmlx.max.js', included: true },
		{ pattern: 'src/**/*.js', included: true },
		{ pattern: 'test/**/*.js', included: true }, 
		// css files are required for size validations
		{ pattern: 'test/main.css', included: false },
		{ pattern: 'vendor/dhtmlx.css', included: false },
		{ pattern: 'vendor/imgs/**/**.*', included: false },
		{ pattern: 'vendor/fonts/**/**.*', included: false }
    ],
	
	// coverage reporter generates the coverage
    reporters: ['progress', 'coverage'],
	
	preprocessors: {
		'src/**/*.js': ['rollup'],
        'test/**/*.js': ['rollup']
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
				paths: [
					'src/', 
					'test/'
				],
				external: [],
				extensions: ['.js', '.json']
			}),
			istanbul({
                exclude: ['test/**/*.spec.js']
            }),
			babel({
				presets: [["es2015", { "modules": false }]],
				plugins: ["external-helpers"]
			})		
		]       
    }
  });
};