
var gulp = require('gulp');
var rollup = require('rollup-stream');
var nodeResolve = require('rollup-plugin-node-resolve');
var source = require('vinyl-source-stream');
// var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
// var babel = require('rollup-plugin-babel');
// var uglify = require('gulp-uglify');
// var css = require('rollup-plugin-css-only');
var eslint = require('rollup-plugin-eslint');
var gulpDocumentation = require('gulp-documentation');
var includePaths = require('rollup-plugin-includepaths');
var KarmaServer = require('karma').Server;

// Default task, creates docs and dist files.
gulp.task('default', ['htmldocs', 'build']);

// Needed to run the watch task
var cache;

// Generates dist files
gulp.task('build', function() {
	return rollup({
      entry: './src/main.js',
	  cache: cache,
	  format: 'cjs',
	  context: 'window',
	  sourceMap: false,
	  plugins: [
		includePaths({
			include: {},
			paths: ['src/'],
			external: [],
			extensions: ['.js', '.json']
		}),
		nodeResolve(),
		// css({ output: 'dist/bundle.css' }),
		eslint(),
		/*
		babel({
			presets: [["es2015", { "modules": false }]],
			plugins: ["external-helpers"]
		})
		*/		
	  ]
    })
	
	.on('bundle', function(bundle) {
      cache = bundle;
    })

    // give the file the name you want to output with
    .pipe(source('src/main.js'))
	
	// buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
    .pipe(buffer())

    // tell gulp-sourcemaps to load the inline sourcemap produced by rollup-stream.
    // .pipe(sourcemaps.init({loadMaps: true}))

    // transform the code further here.
	// .pipe(uglify())

    // if you want to output with a different name from the input file, use gulp-rename here.
    .pipe(rename('dhtmlx-e6.js'))

    // write the sourcemap alongside the output file.
    // .pipe(sourcemaps.write('./'))

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
	}, done).start();
});