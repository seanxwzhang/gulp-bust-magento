/**
 * Created by sean on 1/6/17.
 * This gulp plugin is created to create version stamp on js/css files based on configuration file
 * This script only performs tagging on existing files, so in general it should be the last gulp plugin that you run
 * Maintainer: sean@evestemptation.com
 *
 *
 *
 * Rules for writing Version.js
 * style_config indicates where the config file that should be change is
 * roots specifies the root path for different type of static files
 * files contains specifications of different static files and their information
 */
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const crypto = require('crypto');
const jsonfile = require('jsonfile');
const PluginError = gutil.PluginError;

require('shelljs/global');

const PLUGIN_NAME = 'gulp-bust-magento';
const MAX_DIGIT = 255;
const newVersionFile = './gulp/version.json'; // work around for different path definition in 'require' and jsonfile

function update(version) {
    let nums = version.split(".");
    for (let i = nums.length - 1; i >= 0; i--) {
        if (nums[i] < MAX_DIGIT) {
            nums[i]++;
            break;
        } else if (i == 0) {
            throw PluginError("Maximum version number reached, consider increase MAX_DIGIT");
        }
    }
    return nums.join('.');
}

function vit(versionFile) {
    if (!versionFile) {
        //TODO: add default file, check if file exists
        versionFile = './version.json';
    }

    let versionConfig = require(versionFile);

    // update the xml configuration files and file names
    versionConfig.config.forEach(function(config) {
        config.files.forEach(function(file) {
            //TODO: do some sense checking
            // if auto_increment is toggled, auto increment the versions
            if (versionConfig.auto_increment) {
                file.version = update(file.version);
            }
            // if clean is true, delete all previous version
            if (versionConfig.clean) {
                rm('-f', config.roots[file.type] + file.path + file.name + '.*.' + file.suffix);
            }
            let oldname = file.path + file.name + '.*' + file.suffix;
            let newname = file.path + file.name + '.' + crypto.createHash('md5').update(file.version).digest("hex") + '.' + file.suffix;
            let oldpath = config.roots[file.type] + file.path + file.name + '.' + file.suffix;
            let newpath = config.roots[file.type] + newname;
            sed('-i', oldname, newname, config.style_config);
            cp(oldpath, newpath);
        });
    });

    // if auto_increment is toggled, change the version file as well
    if (versionConfig.auto_increment) {
        jsonfile.writeFile(newVersionFile, versionConfig, {spaces: 2}, function(err){
            if (!err) {
                console.error("write file error: " + err);
            }
        })
    }
}

module.exports = gulp-bust-magento;

