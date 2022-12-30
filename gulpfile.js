import gulp from 'gulp';
import webpackStream from 'webpack-stream';
import through from 'through2';
import rename from 'gulp-rename';
import fs from 'fs';

const pjson = () => {
    return JSON.parse(fs.readFileSync('./package.json'));
}

// https://github.com/gulpjs/gulp/tree/master/docs/writing-a-plugin#modifying-file-content
function stringSrc(string) {
    /**
     * @this {Transform}
     */
    var transform = function(file, encoding, callback) {
        file.contents = Buffer.from(string);
        callback(null, file);
    };

    return through.obj(transform);
}

function getNote() {
    return `// ==UserScript==
// @name         ${pjson().name}
// @version      ${pjson().version}
// @description  ${pjson().description}
// @author       ${pjson().author}
// @match        https://*.tankionline.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tankionline.com

// @require      https://raw.githubusercontent.com/flyover/imgui-js/master/dist/imgui.umd.js
// @require      https://raw.githubusercontent.com/flyover/imgui-js/master/dist/imgui_impl.umd.js

// @downloadURL  https://raw.githubusercontent.com/${pjson().author}/${pjson().name}/main/release/${pjson().name}.user.js
// @updateURL    https://raw.githubusercontent.com/${pjson().author}/${pjson().name}/main/release/${pjson().name}.meta.js

// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow

// ==/UserScript==`
}

function compileScript() {
    return gulp.src('src/**/*.js')
        .pipe(webpackStream({
            mode: 'production',
            output: {
                filename: 'TOHBA.min.js'
            }
        }))
        .pipe(gulp.dest('release'));
}

function compileMeta() {
    return gulp.src('package.json')
        .pipe(rename(path => {
            path.basename = `${pjson().name}`,
            path.extname = '.meta.js'
        }))
        .pipe(stringSrc(getNote()))
        .pipe(gulp.dest('release'));
}

function compileUser() {
    return gulp.src('package.json')
        .pipe(rename(path => {
            path.basename = `${pjson().name}`,
            path.extname = '.user.js'
        }))
        .pipe(stringSrc(`${getNote()}\n\nGM_xmlhttpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/${pjson().author}/${pjson().name}/main/release/${pjson().name}.min.js',
    nocache: true,
    onload: r => eval(r.responseText)
})

// Писать код здесь`))
        .pipe(gulp.dest('release'));
}

gulp.task('default', () => {
    gulp.watch(['src/**/*.js'], compileScript);
    gulp.watch(['package.json'], gulp.series(compileUser, compileMeta));
})