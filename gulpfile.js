var gulp = require('gulp');
var server = require('gulp-server-livereload');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var uncss = require('gulp-uncss');
var csso = require('gulp-csso');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var cleanDest = require('gulp-clean-dest');
var ftp = require('vinyl-ftp');
var notify = require('gulp-notify');
var inky = require('inky');
var inlineCss = require('gulp-inline-css');
var inlinesource = require('gulp-inline-source');


//SERVER	
gulp.task('serv', function() {
  gulp.src('./app')
    .pipe(server({
      livereload: true,
      defaultFile: 'index.html',
      open: true
    }));
});

//STYLES
gulp.task('styles', function () {
  return gulp.src('./app/sass/**/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(prefix({
		browsers: ['last 15 versions'],
		cascade: false
	}))
    .pipe(gulp.dest('./app/css'));
});

//IMAGES
gulp.task('images', function () {
    return gulp.src('./app/img/**/*')
        .pipe(imagemin({
          progressive: true
        }))
        .pipe(gulp.dest('build/img'));
});

//BUILD
gulp.task('build', ['images'] ,function () {
    return gulp.src('./app/index.html')
        .pipe(cleanDest('build'))
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', csso()))
        .pipe(gulp.dest('build'));
});
//ftp
gulp.task('send', ['build', 'images'], function() {
    var conn = ftp.create( {
        host:     '77.120.110.166',
        user:     'alexlabs',
        password: 'Arj4h00F9x',
        parallel: 5
    } );

    /* list all files you wish to ftp in the glob variable */
    var globs = [
        'kiev/**/*',
        '!node_modules/**' // if you wish to exclude directories, start the item with an !
    ];

    return gulp.src( globs, { base: '.', buffer: false } )
        .pipe( conn.newer( '/public_html/' ) ) // only upload newer files
        .pipe( conn.dest( '/public_html/' ) )
        .pipe(notify("Dev site updated!"));

});

//CONVERTE INKY
gulp.task('inky', ['styles'], function() {
  return gulp.src('./app/**/*.html')
    .pipe(inlinesource())
    .pipe(inky())
    .pipe(inlineCss({
        preserveMediaQueries: true
    }))
    .pipe(gulp.dest('./build'));
});


//watchers
gulp.task('watch', function () {
    gulp.watch('./app/**/*.html', ['inky']);
    gulp.watch('./app/sass/**/*.sass', ['inky']);
});

gulp.task('start', ['serv', 'watch']);