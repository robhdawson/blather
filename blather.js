// utilities
var isArray = Array.isArray;

var sample = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};

// default options functions
var defaultIsStarter = function(key, index) {
  return !!key.match(/^[A-Z]/);
};

var defaultCleaner = function(textArray) {
  return textArray.join(" ");
};

var defaultSplitter = function(text) {
  return text.split(/\s+/);
};


// actual module
var Blather = module.exports = function(options) {
  options = options || {};

  this.isStarter = options.isStarter || defaultIsStarter;
  this.cleaner = options.cleaner || defaultCleaner;
  this.splitter = options.splitter || defaultSplitter;

  this.dictionary = {
    depth: (options.depth || 2),
    joiner: (options.joiner || " "),
    starters: [],
    chains: {}
  };
};

Blather.prototype.loadDictionary = function(dictionary) {
  this.dictionary = dictionary;
};

Blather.prototype.addText = function(text) {
  if(text.replace(/\s+/, "").length <= 1) { return; }

  var tokens = this.splitter(text);
  var limit = tokens.length - 1 - this.dictionary.depth;

  tokens.forEach(function(token, i) {
    if(i > limit) { return; };

    key = tokens.slice(i, i + this.dictionary.depth).join(this.dictionary.joiner);
    
    if(this.isStarter(key, i)) {
      this.dictionary.starters.push(key);
    };

    this.dictionary.chains[key] = this.dictionary.chains[key] || [];
    this.dictionary.chains[key].push(tokens[i + this.dictionary.depth]);
  }.bind(this));
};

var defaultStopCondition = function(chain) {
  var key = chain.slice(chain.length - this.dictionary.depth, chain.length).join(this.dictionary.joiner);
  return chain.length >= 1000 || !this.dictionary.chains[key]
};


Blather.prototype.fill = function(stopCondition, startKey) {
  var chains = this.dictionary.chains;
  var depth = this.dictionary.depth;
  var joiner = this.dictionary.joiner;

  if(!startKey) { startKey = sample(this.dictionary.starters); };
  if(!stopCondition) {
    stopCondition = defaultStopCondition.bind(this);
  };

  var chain = startKey.split(joiner);
  var key, nexts;

  while(!stopCondition(chain)) {
    key = chain.slice(chain.length - depth, chain.length).join(joiner);
    nexts = chains[key];
    if(!nexts) { break; };
    chain.push(sample(nexts));
  };


  return this.cleaner(chain);
};

Blather.prototype.sentence = function(startKey) {
  if(!startKey) { startKey = sample(this.dictionary.starters); };

  return this.fill(function(chain) {
    return chain[chain.length - 1].match(/[\.\!\?]+\s*$/);
  }, startKey);
};

Blather.prototype.paragraph = function(lengths) {
  if(!lengths) { lengths = [3, 4, 4, 5]}
  if(!isArray(lengths)) { lengths = [lengths]; };

  var limit = sample(lengths);

  return this.fill(function(chain) {
    return chain.join("").replace(/[^\.\?\!]/g, "").length >= limit;
  });
};


// file stuff: reading, saving, loading
var fs = require('fs');

Blather.prototype.loadDictionaryFile = function(path) {
  this.dictionary = JSON.parse(fs.readFileSync(path));
};

Blather.prototype.saveDictionary = function(path) {
  fs.writeFileSync(path, JSON.stringify(this.dictionary), {encoding: 'utf8'});
};

Blather.prototype.addFiles = function(paths) {
  if(!isArray(paths)) { paths = [paths] };
  paths.forEach(this.addFile.bind(this));
};

Blather.prototype.addFile = function(path) {
  this.addText(fs.readFileSync(path, {encoding: 'utf8'}));
};
