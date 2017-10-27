
// gulp imports
var gulp = require('gulp');
var rename = require('gulp-rename');
var gulpDocumentation = require('gulp-documentation');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var eslint = require('rollup-plugin-eslint');

// rollup imports
var rollup = require('rollup-stream');
var includePaths = require('rollup-plugin-includepaths');
var nodeResolve = require('rollup-plugin-node-resolve');

// testing imports
var KarmaServer = require('karma').Server;

// Default task, creates docs and dist files.
gulp.task('default', ['build']);

// Needed to run the watch task
var cache;

// Generates dist files
gulp.task('build', function() {
	return rollup({
      input: './src/main.js',
	  cache: cache,
	  sourcemap: 'inline',
	  format: 'es',
	  plugins: [
		includePaths({
			include: {},
			paths: ['src/'],
			external: [],
			extensions: ['.js', '.json']
		}),
		nodeResolve(),
		eslint(),	
	  ]
    })
	
	.on('bundle', function(bundle) {
      cache = bundle;
    })

    // give the file the name you want to output with
    .pipe(source('src/main.js'))
	
	// buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
    .pipe(buffer())

    // if you want to output with a different name from the input file, use gulp-rename here.
    .pipe(rename('dhtmlx-e6.js'))

    // and output to ./dist/app.js as normal.
    .pipe(gulp.dest('./dist'));
});

// Watch for changes in the code!
gulp.task('watch', function() {
	gulp.watch('./src/**/*.js', ['build']);
});

// Generating a pretty HTML documentation site
gulp.task('htmldocs', function () {
	return gulp.src('src/**/*.js')
		.pipe(gulpDocumentation('html'))
		.pipe(gulp.dest('./docs/'));
});

// Run test once and exit
gulp.task('test', function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js',
		singleRun: true
	}, done).start();
});

// Watch for file changes and re-run tests on each change
gulp.task('tdd', function (done) {
	new KarmaServer({
		configFile: __dirname + '/karma.conf.js'
	}, function() { done(); }).start();
});

// Deploys in the local dhtmlx-e6-demo project
gulp.task('deploy-demo', function() {
	return gulp.src('dist/dhtmlx-e6.js')
    .pipe(gulp.dest('../dhtmlx-e6-demo/node_modules/dhtmlx-e6/dist'));
});
