function arraySample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function defaultIsStart(key, index) {
    return index === 0;
}

function defaultClean(textArray) {
    return textArray.join(' ');
}

function defaultSplit(text) {
    return text.split(/\s+/);
}

var defaultDepth = 2;

var defaultJoiner = '<|>';

var Blather = function(options) {
    options = options || {};

    var isStart = options.isStart || defaultIsStart;
    var clean = options.clean || defaultClean;
    var split = options.split || defaultSplit;
    var depth = options.depth || defaultDepth;
    var joiner = options.joiner || defaultJoiner;

    var dictionary = options.dictionary || {starts: [], chains: {}}

    function addFragment(text) {
        var tokens = split(text);
        var limit = tokens.length - 1 - depth;

        tokens.forEach(function(token, i) {
            if (i > limit) {
                return;
            }

            key = tokens.slice(i, i + depth).join(joiner);

            if (isStart(key, i)) {
                dictionary.starts.push(key);
            }

            dictionary.chains[key] = dictionary.chains[key] || [];
            dictionary.chains[key].push(tokens[i + depth]);
        });
    }

    function generateFragment() {
        var start = arraySample(dictionary.starts);
        return fill(start, shouldStopFragment);
    }

    function fill(start, stopCondition) {
        var chain = start.split(joiner);
        var key = chain.slice(chain.length - depth).join(joiner);

        while (dictionary.chains[key] && !stopCondition(chain)) {
            chain.push(arraySample(dictionary.chains[key]));
            key = chain.slice(chain.length - depth).join(joiner);
        }

        return clean(chain);
    }

    function stringify() {
        return JSON.stringify({
            depth: depth,
            joiner: joiner,
            dictionary: dictionary
        });
    }

    function shouldStopFragment(chain) {
        return chain.length >= 1000;
    }

    return {
        addFragment: addFragment,
        generateFragment: generateFragment,
        fill: fill,
        stringify: stringify
    };
}

Blather.destringify = function(stringified) {
    return Blather(JSON.parse(stringified));
}

module.exports = Blather;
