module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        babel: {
            options: {
                sourceMap: false,
                presets: ['babel-preset-env']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: [
                        'assets/scripts/*.js',
                        'assets/scripts/*/*.js',
                        'assets/scripts/*/*/*.js'
                    ],
                    dest: 'dist',
                }]
            }
        },
        uglify: {
            options: {
                banner: '/*!\n* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n' +
                    '* version: <%= pkg.version %>\n' +
                    '* author: <%= pkg.author.name %>\n' +
                    '* email: <%= pkg.author.email %>\n' +
                    '* url: <%= pkg.author.url %>\n' +
                    '*/\n'
            },
            my_target: {
                files: [{
                    expand: true,
                    src: [
                        'assets/scripts/*.js',
                        'assets/scripts/*/*.js',
                        'assets/scripts/*/*/*.js'
                    ],
                    dest: 'dist',
                    cwd: 'src',
                    rename: function(dst, src) {
                        // To keep the source js files and make new files as `*.min.js`:
                        // return dst + '/' + src.replace('.js', '.min.js');
                        // Or to override to src:
                        return dst + '/' + src;
                    }
                }]
            }
        },
        copy: {
            main: {
                files: [{
                    expand: true,
                    src: [
                        'htmls/**',
                        'assets/plugins/**',
                        'assets/templates/**',
                        'assets/image/**'
                    ],
                    dest: 'dist',
                    cwd: 'src'
                }]
            }
        },
        cssmin: {
            my_target: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: [
                        'assets/style/*.css'
                    ],
                    dest: 'dist',
                    ext: '.css'
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-babel');

    // 加载 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 加载 "copy" 任务的插件
    grunt.loadNpmTasks('grunt-contrib-copy');

    // 加载 "cssmin" 任务的插件
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['babel','uglify', 'copy', 'cssmin']);
};