var fs = require('fs');


var nativeIsArray = Array.isArray;
var isArray = function(obj) {

};

var defaultIsStarter = function(token) {
  return token.match(/^[A-Z]/);
};

var defaultCleaner = function(textArray) {
  var result = textArray.join(" ")
    .replace(/[”“]/g, "\"")
    .replace(/[’]/g, "'")
    .replace(/\…/g, "...")
    .replace(/ ([^\w])/g, "$1")
    .replace(/\"+/g, "\"")
    .replace(/\" ([^\"]+)\"/g, " \"$1\"")
    .replace(/\( /g, " (")
    .replace(/([\'\-\–]) +(\w)/g, "$1$2");

  return result;
};

var defaultSplitter = function(text) {
  return text.split(/\s+/);
};

var sample = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};

var Meerkat = module.exports = function(options) {
  options = options || {};

  this.isStarter = options.isStarter || defaultIsStarter;
  this.cleaner = options.cleaner || defaultCleaner;
  this.splitter = options.splitter || defaultSplitter;

  this.dictionary = {
    depth: (options.depth || 2),
    joiner: (options.joiner || " "),
    chains: {},
    starters: []
  };
};

Meerkat.prototype.loadDictionary = function(dictionary) {
  this.dictionary = dictionary;
};

Meerkat.prototype.loadDictionaryFile = function(path) {
  this.dictionary = require(path);
};

Meerkat.prototype.saveDictionary = function(path) {
  fs.writeFileSync(path, JSON.stringify(this.dictionary), {encoding: 'utf8'});
}

Meerkat.prototype.addFiles = function(paths) {
  if(isArray(paths)) { paths = [paths] };
  paths.forEach(this.addFile.bind(this))
};

Meerkat.prototype.addFile = function(path) {
  this.addText(fs.readFileSync(path, {encoding: 'utf8'}));
};

Meerkat.prototype.addText = function(text) {
  if(text.replace(/\s+/, "").length <= 1) { return; }

  var tokens = this.splitter(text);
  var limit = tokens.length - 1 - this.dictionary.depth;

  tokens.forEach(function(token, i) {
    if(i > limit) { return; };

    key = tokens.slice(i, i + this.dictionary.depth).join(this.dictionary.joiner);
    
    if(this.isStarter(key)) {
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


Meerkat.prototype.fill = function(stopCondition, startKey) {
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

Meerkat.prototype.sentence = function(startKey) {
  if(!startKey) { startKey = sample(this.dictionary.starters); };

  return this.fill(function(chain) {
    return chain[chain.length - 1].match(/[\.\!\?]+\s*$/);
  }, startKey);
};

Meerkat.prototype.paragraph = function(lengths) {
  if(!lengths) { lengths = [3, 4, 4, 5]}
  if(!isArray(lengths)) { lengths = [lengths]; };

  var limit = sample(lengths);

  return this.fill(function(chain) {
    return chain.join("").replace(/[^\.\?\!]/g, "").length >= limit;
  });
};



