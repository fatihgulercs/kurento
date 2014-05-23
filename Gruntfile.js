/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 */


module.exports = function(grunt)
{
  var DIST_DIR = 'dist';

  // Project configuration.
  grunt.initConfig(
  {
    pkg: grunt.file.readJSON('package.json'),

    // Plugins configuration
    clean:
    {
      generated_code: [DIST_DIR, 'src'],

      generated_doc: '<%= jsdoc.all.dest %>'
    },

    jsdoc:
    {
      all:
      {
        src: ['README.md', 'lib/**/*.js', 'test/*.js'], 
        dest: 'doc/jsdoc'
      }
    },

    curl:
    {
      'shims/sockjs-0.3.js': 'http://cdn.sockjs.org/sockjs-0.3.js'
    },

    browserify:
    {
      require:
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>_require.js'
      },

      standalone:
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>.js',

        options:
        {
          bundleOptions: {
            standalone: 'KwsMedia'
          }
        }
      },

      'require minified':
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>_require_sourcemap.js',

        options:
        {
          debug: true,
          plugin: [
            ['minifyify',
             {
               compressPath: DIST_DIR,
               map: '<%= pkg.name %>.map'
             }]
          ]
        }
      },

      'standalone minified':
      {
        src:  '<%= pkg.main %>',
        dest: DIST_DIR+'/<%= pkg.name %>_sourcemap.js',

        options:
        {
          debug: true,
          bundleOptions: {
            standalone: 'KwsMedia'
          },
          plugin: [
            ['minifyify',
             {
               compressPath: DIST_DIR,
               map: '<%= pkg.name %>.map',
               output: DIST_DIR+'/<%= pkg.name %>.map'
             }]
          ]
        }
      }
    },

    copy:
    {
      maven:
      {
        expand: true,
        cwd: DIST_DIR,
        src: '*',
        dest: 'src/main/resources/js/',
      }
    }
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-curl');

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-jsdoc');

  // Default task(s).
  grunt.registerTask('default', ['clean', 'jsdoc', 'curl', 'browserify']);
  grunt.registerTask('maven',   ['default', 'copy']);
};
