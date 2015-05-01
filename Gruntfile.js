/* jshint node: true */
'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    jscs: {
      main: ['Gruntfile.js', 'public/js/**/*.js']
    },
    jshint: {
      options: {
        jshintrc: true
      },
      files: {
        src: ['Gruntfile.js', 'public/js/**/*.js']
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.registerTask('default', ['lint']);
  grunt.registerTask('lint', ['jscs', 'jshint']);
};
