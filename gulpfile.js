var gulp = require('gulp');
var sass = require('gulp-sass');
var open = require('gulp-open');
var nodemon = require('gulp-nodemon');

var path = {
  sassDir: './client/scss/*.scss',
  sassSrc: './client/scss/main.scss',
  cssRoot: './client/css',
  server: './server/index.js'
}

gulp.task('sass', function () {
  return gulp.src(path.sassSrc)
    .pipe(sass())
    .pipe(gulp.dest(path.cssRoot));
});

gulp.task('watch', function() {
  gulp.watch(path.sassDir, ['sass']);
});

gulp.task('expressDev', function() {
  nodemon({
    script: path.server,
  })
  .on('restart', function() {
    console.log('restarted server');
  });
});

gulp.task('open', function(){
  var options = {
    url: 'http://localhost:3000',
    // app: 'firefox'
  };
  gulp.src('./index.html')
  .pipe(open('', options));
});


gulp.task('default', ['sass', 'watch', 'expressDev','open']);
