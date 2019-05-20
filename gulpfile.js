const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleancss = require('gulp-clean-css');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const del = require('del');
const path = require('path');

/*
 * One common object with paths
 */
const paths = {
  dist: { // Here we will define where to put the compiled files after build
    js: 'app/js/',
    scss: 'app/css'
  },
  app: { // Where to get the sources
    html: 'app/**/*.html',
    js: [
      // 'app/libs/jquery/dist/jquery.min.js',
      'app/js/main.js' // Always at the end
    ],
    scss: 'app/scss/*.scss', // In styles and scripts, we only need main files.
    // css: 'app/css/*.css',
    // img: 'app/img/**/*.*', // The syntax img/**/*.* means to take all the files of all extensions from a folder and from nested directories
    // fonts: 'app/fonts/**/*.*'
  },
  watch: { // Here we define the changes of which files we want to observe
    html: 'app/**/*.html',
    js: 'app/js/main.js',
    scss: 'app/scss/**/*.scss',
    // css: 'app/css/**/*.css',
    // img: 'app/img/**/*.*',
    // fonts: 'app/fonts/**/*.*'
  }
}

/*
 * Local Server
 */
function serve() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
    notify: false,
    // open: false,
    // online: false, // Work Offline Without Internet Connection
    // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
  });
}

/*
 * Compile scss into css
 */
function styles() {
  // 1. where is my scss file
  return gulp.src(paths.app.scss)
    // 2. pass that file through sass compiler
    .pipe(sass({ 
      outputStyle: 'expanded',
      includePaths: [path.join(__dirname, '/node_modules')]
    }).on('error', notify.onError()))
    // 3. rename output file
    .pipe(rename({
      prefix: '',
      basename: 'bundle',
      suffix: '.min'
    }))
    // 4. add vendor prefixes
    .pipe(autoprefixer(['last 15 versions']))
    // 5. minify css
    .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
    // 6. where do I save the compiled CSS?
    .pipe(gulp.dest(paths.dist.scss))
    // 7. stream changes to all browsers
    .pipe(browserSync.stream());
}

/*
 * JS
 */
function scripts() {
  return gulp.src(paths.app.js)
    .pipe(concat('bundle.min.js'))
    .pipe(uglify()) // Mifify js (opt.)
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.reload({ stream: true }));
}

/*
 * HTML Live Reload
 */
function code() {
  return gulp.src(paths.app.html)
    .pipe(browserSync.reload({ stream: true }));
}

/*
 * Watchers
 */
function watch() {
  gulp.watch(paths.watch.scss, styles);
  gulp.watch(paths.watch.js, scripts);
  gulp.watch(paths.watch.html, code);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
const build = gulp.series(gulp.parallel(styles, scripts));

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.serve = serve;
exports.styles = styles;
exports.scripts = scripts;
exports.code = code;
exports.watch = watch;
exports.build = build;

/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = gulp.parallel(serve, watch);