var fs = require('fs');
var path = require('path');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Indexgen() {
  this.self = this;
  this.igignore = [];
  EventEmitter.call(this);
}

util.inherits(Indexgen, EventEmitter);

Indexgen.prototype.init = function() {
  this.igignore = [".git", "node_modules"];
  this.igignore = this.parseIgignore(this.igignore);
};

Indexgen.prototype.parseIgignore = function(igignore) {
  var igignoreFile = '';
  var igignoreFilename = path.join('./', 'igignore.json');
  var resultingIgignore = [];

  if (fs.existsSync(igignoreFilename)) {
    igignoreFile = fs.readFileSync(igignoreFilename);
    return igignore.concat(JSON.parse(igignoreFile));
  } else {
    this.emit('info', 'igignore.json file is malformed or doesnt exist. Using default values instead.');
  }

  return igignore;
};

Indexgen.prototype.indexgen = function(currentPath) {
  var files = this.getFiles(currentPath);
  var dirs = this.getDirectories(currentPath);
  var indexjs = this.generateIndex(currentPath);
  var self = this;

  files.forEach(function(file) {
    var currentFile = self.generatePath(currentPath, file);

    if (!self.shouldIgnoreFile(currentFile)) {
      self.indexFile(currentPath, currentFile);
    }
  });

  dirs.forEach(function(dir) {
    var currentDir = self.generatePath(currentPath, dir);

    if (!self.shouldIgnoreDirectory(self.igignore, currentDir)) {
      self.indexgen(currentDir);
    }
  });
};

Indexgen.prototype.getFiles = function (currentPath) {
  var files = fs.readdirSync(currentPath);
  var self = this;

  return files.filter(function(file) {
    var currentFile = self.generatePath(currentPath, file);
    return fs.lstatSync(currentFile).isFile();
  });
};

Indexgen.prototype.getDirectories = function(currentPath) {
  var files = fs.readdirSync(currentPath);
  var self = this;

  return files.filter(function(file) {
    var currentFile = self.generatePath(currentPath, file);
    return fs.lstatSync(currentFile).isDirectory();
  });
};

Indexgen.prototype.shouldIgnoreFile = function(currentFile) {
  var stat = fs.lstatSync(currentFile);

  if (stat && stat.isFile() && (path.dirname(currentFile) != '.') && (path.extname(currentFile) == '.js')) {
    return false;
  }

  return true;
};

Indexgen.prototype.indexFile = function(currentPath, currentFile) {
  var indexPath = '';

  if (path.basename(currentFile) != "index.js") {
    indexPath = this.generatePath(currentPath, 'index.js');
    fs.appendFileSync(indexPath, this.generateExportsFor(currentFile));
    this.emit('indexed', indexPath + ' indexed.');
  }
};

Indexgen.prototype.generateIndex = function(currentPath) {
  var indexPath = '';
  var indexGenerated = null;

  if (currentPath != '.') {
    indexPath = this.generatePath(currentPath, 'index.js');
    indexGenerated = fs.openSync(indexPath, 'w');

    if (indexGenerated) {
      this.emit('generated', indexPath + ' generated.');
    }

    return indexGenerated;
  }
};

Indexgen.prototype.generateExportsFor = function(filename) {
  var basename = path.basename(filename, '.js');
  return "module.exports." + basename + " = require('./" + basename + ".js');\n";
};

Indexgen.prototype.generatePath = function(currentPath, currentFile) {
  return currentPath + path.sep + currentFile;
};

Indexgen.prototype.shouldIgnoreDirectory = function(igignore, currentFile) {
  currentFile = currentFile.substr(2, currentFile.length);

  if (igignore.indexOf(currentFile) != -1) this.emit('info', 'Directory ' + currentFile + ' discarded.');
  return igignore.indexOf(currentFile) != -1;
};

Indexgen.prototype.undo = function(currentPath) {
  var dirs = this.getDirectories(currentPath);
  var indexjs = this.generatePath(currentPath, 'index.js');
  var self = this;

  if ((currentPath != '.') && (fs.existsSync(indexjs))) {
    fs.unlink(indexjs);
    this.emit('removed', indexjs + ' deleted.');
  }

  dirs.forEach(function(dir) {
    var currentDir = self.generatePath(currentPath, dir);

    if (!self.shouldIgnoreDirectory(self.igignore, currentDir)) {
      self.indexgen(currentDir);
    }
  });
};

module.exports = Indexgen;