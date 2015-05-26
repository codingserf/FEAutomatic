var gulp = require('gulp');
var jshint = require('gulp-jshint'); //校验js语法规范
var concat = require('gulp-concat'); //连接文件
var uglify = require('gulp-uglify'); //压缩js
var less = require('gulp-less'); //less 2 css
var sass = require('gulp-sass'); //scss 2 css
var minifyCSS = require('gulp-minify-css'); //压缩css
var minifyHTML = require('gulp-minify-html'); //压缩html
var sourcemaps = require('gulp-sourcemaps'); //添加sourcemap
var imagemin = require('gulp-imagemin'); //压缩图片
var cache = require('gulp-cache'); //缓存图片，防止重复压缩
var plumber = require('gulp-plumber'); //防止less编译报错阻断watch
var inject = require('gulp-inject'); //替换html里的内容 和inject相似
var browserSync = require('browser-sync'); //mobile debug liveload
var replace = require('gulp-replace'); //替换文件内容
var rename = require('gulp-rename'); //重命名文件
var exec = require('child_process').exec; //执行命令行
var rimraf = require('gulp-rimraf'); //删除文件
var react = require('gulp-react'); //react jsx编译
var path = require('path');

var config = require('./config.js'); //加载我们的配置文件
var version = config.version;
var paths = config.paths;
var dir_release = paths.release.ver ? paths.release.dir + version + '/' : paths.release.dir;
var css_libs = paths.lib.css;
var js_libs = paths.lib.js;
var apiReg = paths.api.reg;
var apiRep = paths.api.rep;
var timestamp = new Date();
var revTemp = (Math.random()*timestamp.getDate()).toString().substr(-3)+(Math.random()*timestamp.getMilliseconds()).toString().substr(-3);
var rev = paths.release.rev ? '-'+version+'.'+ revTemp : '';


/* 源文件 task */
//less编译
gulp.task('src:less', function() {
    return gulp.src('src/css/**/*.less')
        .pipe(plumber()) //防报错影响watch
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest('src/css/'));
});
//sass编译
gulp.task('src:sass', function() {
    return gulp.src('src/css/**/*.scss')
        .pipe(plumber()) //防报错影响watch
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest('src/css/'));
});
// js hint
gulp.task('src:jshint', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 监视文件的变化
gulp.task('src:watch', ['src:less', 'src:sass'], function() {
    gulp.watch('src/css/**/*.less', ['src:less']);
    gulp.watch('src/css/**/*.scss', ['src:sass']);
    gulp.watch('src/js/**/*.js', ['src:jshint']);
});
// 注入
gulp.task('src:inject', ['src:less', 'src:sass'], function() {
    var target = gulp.src('src/*.html');

    // It's not necessary to read the files (will speed up things), we're only after their paths: 
    var sources_libcss = gulp.src(css_libs, {
        read: false
    });
    var sources_libjs = gulp.src(js_libs, {
        read: false
    });
    var sources_pagecss = gulp.src('src/css/*.css', {
        read: false
    });
    var sources_pagejs = gulp.src('src/js/*.js', {
        read: false
    });

    return target.pipe(inject(sources_libcss, {
            relative: true,
            starttag: '<!-- inject:lib:css -->'
        }))
        .pipe(inject(sources_libjs, {
            relative: true,
            starttag: '<!-- inject:lib:js -->'
        }))
        .pipe(inject(sources_pagecss, {
            relative: true,
            starttag: '<!-- inject:page:css -->',
            transform: function(filepath, file, i, length, targetFile) {
                var srcName = path.basename(filepath, '.css'),
                    tarName = path.basename(targetFile.path, '.html');
                return srcName !== tarName ? null : inject.transform.apply(inject.transform, arguments);
            }
        }))
        .pipe(inject(sources_pagejs, {
            relative: true,
            starttag: '<!-- inject:page:js -->',
            transform: function(filepath, file, i, length, targetFile) {
                var srcName = path.basename(filepath, '.js'),
                    tarName = path.basename(targetFile.path, '.html');
                return srcName !== tarName ? null : inject.transform.apply(inject.transform, arguments);
            }
        }))
        .pipe(gulp.dest('src/'));
});

//清除缓存
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});
//初始化(总)
gulp.task('src:setup', ['clear','src:inject']);

/* 发布 task */
// 移动 fonts
gulp.task('release:fonts', function() {
    //判断有没有引用bootstrap，如果有就复制fonts文件到src相对路径中
    var bs_pattern = 'css/bootstrap.css';
    css_libs.forEach(function(val, index) {
        if (val.indexOf(bs_pattern) > -1) {
            var bs_fonts = val.replace(bs_pattern, 'fonts/*');
            gulp.src(bs_fonts)
                .pipe(gulp.dest('src/fonts/'));
            return false;
        }
    });

    return gulp.src('src/fonts/*')
        .pipe(gulp.dest(dir_release + 'fonts'));
});

//移动 views
gulp.task('release:views', function() {
    return gulp.src('src/views/**/*.html')
        .pipe(gulp.dest(dir_release + 'views/'));
});
//压缩lib css
gulp.task('release:minLibCss', /*['release:fonts'],*/ function() {
    return gulp.src(css_libs)
        .pipe(minifyCSS())
        .pipe(concat('lib.css'))
        .pipe(rename(function (path) {
            path.basename += rev;
        }))
        .pipe(gulp.dest(dir_release + 'css/'));
});
//压缩page css
gulp.task('release:minPageCss', /*['release:fonts'],*/ function() {
    return gulp.src('src/css/*.css')
        .pipe(minifyCSS())
        .pipe(rename(function (path) {
            path.basename += rev;
        }))
        //.pipe(concat('app.css')) 不用连接
        .pipe(gulp.dest(dir_release + 'css/'));
});
//压缩 css(总)
gulp.task('release:css', ['release:minLibCss', 'release:minPageCss']);

//压缩 lib js
gulp.task('release:minLibJs', function() {
    return gulp.src(js_libs)
        .pipe(replace(apiReg, apiRep)) //替换
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('lib.js'))
        .pipe(rename(function (path) {
            path.basename += rev;
        }))
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest(dir_release + 'js/'));
});
// 压缩 page js
gulp.task('release:minPageJs', function() {
    return gulp.src('src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(replace(apiReg, apiRep)) //替换
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += rev;
        }))
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest(dir_release + 'js/'));
});
// 压缩 js(总)
gulp.task('release:js', ['release:minLibJs', 'release:minPageJs']);

//压缩CSS引用图片
gulp.task('release:minHtmlImg', function() {
    return gulp.src('src/img/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(dir_release + 'img/'));
});
//压缩 html中的图片
gulp.task('release:minCssImg', function() {
    return gulp.src('src/css/img/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(dir_release + 'css/img/'));
});
//压缩图片(总)
gulp.task('release:img', ['release:minHtmlImg', 'release:minCssImg']);


// 注入
gulp.task('release:inject', ['release:css', 'release:js'], function() {
    var target = gulp.src('src/*.html').pipe(gulp.dest(dir_release + ''));

    var sources_libcss = gulp.src(dir_release + 'css/lib'+rev+'.css', {
        read: false
    });
    var sources_libjs = gulp.src(dir_release + 'js/lib'+rev+'.js', {
        read: false
    });
    var sources_pagecss = gulp.src(dir_release + 'css/*.css', {
        read: false
    });
    var sources_pagejs = gulp.src(dir_release + 'js/*.js', {
        read: false
    });


    return target.pipe(inject(sources_libcss, {
            relative: true,
            starttag: '<!-- inject:lib:css -->'
        }))
        .pipe(inject(sources_libjs, {
            relative: true,
            starttag: '<!-- inject:lib:js -->'
        }))
        .pipe(inject(sources_pagecss, {
            relative: true,
            starttag: '<!-- inject:page:css -->',
            transform: function(filepath, file, i, length, targetFile) {
                var srcName = path.basename(filepath, '.css').replace(rev,''),
                    tarName = path.basename(targetFile.path, '.html');
                return srcName !== tarName ? null : inject.transform.apply(inject.transform, arguments);
            }
        }))
        .pipe(inject(sources_pagejs, {
            relative: true,
            starttag: '<!-- inject:page:js -->',
            transform: function(filepath, file, i, length, targetFile) {
                var srcName = path.basename(filepath, '.js').replace(rev,''),
                    tarName = path.basename(targetFile.path, '.html');
                return srcName !== tarName ? null : inject.transform.apply(inject.transform, arguments);
            }
        }))
        .pipe(gulp.dest(dir_release));
});
//压缩 view html
gulp.task('release:minViewHtml', ['release:views'], function() {
    var opts = {
        empty: true,
        conditionals: true,
        spare: true,
        quotes: true
    };
    return gulp.src(dir_release + 'views/**/*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(dir_release + 'views/'));
});
//压缩 page html
gulp.task('release:minPageHtml', ['release:inject'], function() {
    var opts = {
        conditionals: true,
        spare: true,
        quotes: true
    };

    return gulp.src(dir_release + '*.html')
        .pipe(minifyHTML(opts))
        .pipe(gulp.dest(dir_release));
});
//压缩 html
gulp.task('release:html', ['release:minViewHtml', 'release:minPageHtml']);
//清除发布目录
gulp.task('release:clean', function(cb) {
    return gulp.src([dir_release + 'js/**/*.js', dir_release + 'css/**/*.css', dir_release + 'js/maps/*.map'], { read: false })
    .pipe(rimraf({ force: true }));
});

//发布(总)
gulp.task('release', ['release:fonts', 'release:views', 'release:img', 'release:inject']);
//加一个js/css不压缩的dev版本

//带html压缩的发布(总)
gulp.task('release:+minhtml', ['release:fonts', 'release:img', 'release:html']);

// browser-sync Static server
gulp.task('debug', function() {
    var debug = config.paths.debug;
    var debugOpts = debug.proxy === '' || debug.proxy === undefined ? {server:{baseDir:debug.baseDir}} : {proxy: debug.proxy};
    browserSync(debugOpts);

    //监听文件变化实时更新
    gulp.watch("./src/**/*.*").on('change', browserSync.reload);
});
