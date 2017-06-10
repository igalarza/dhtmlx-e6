
var nodeResolve = require('rollup-plugin-node-resolve');
var includePaths = require('rollup-plugin-includepaths');
var buble = require('rollup-plugin-buble');
var istanbul = require('rollup-plugin-istanbul');

module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
		// depends
		{ pattern: 'vendor/dhtmlx.max.js', included: true },
		{ pattern: 'src/**/*.js', included: true },
		
		// tests
		{ pattern: 'test/**/*.js', included: true }, 
		
		// css files are required for size validations
		'test/main.css',
		'vendor/dhtmlx.css',
		
		// assets
		{ pattern: 'vendor/imgs/**/**.*', watched: false, included: false, served: true, nocache: false},
		{ pattern: 'vendor/fonts/**/**.*', watched: false, included: false, served: true, nocache: false},
		
		// fixtures
        'test/body.html'
    ],
	
	// coverage reporter generates the coverage
    reporters: ['progress', 'coverage'],
	
	preprocessors: {
		'test/*.html': ['html2js'],
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
			buble()		
		]       
    }
  });
};