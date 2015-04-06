Blather
====================================

Blather is a little js library for generating text with Markov chains.


###A Simple Example

```javascript
var Blather = require('./blather')
var blatherer = new Blather()

blatherer.addText('I like dogs. I like cats too. I like cats who like dogs who like cats.')

blatherer.sentence() // 'I like cats who like cats.' or something
```

###Options
A new Blather object can be customized with the following options:

```javascript
var blatherer = new Blather({
  depth: 2,
  joiner: ' ',
  splitter: function(text) {},
  cleaner: function(textArray) {},
  isStarter: function(key, index) {}
})
```

`depth` refers the length of tokens (words, usually) used to determine the next token in the Markov chain; the higher the number, the more likely it is to simply reproduce original fragments of the source text. By default, it's 2.

`joiner` is a string used to join arrays of tokens for storage as keys in the dictionary. A single space, the default, should usually be fine, but it's customizable just in case.

`splitter` is a function used to tokenize text. It should return an array. By default, it splits using the regex `/\s+/`.

`cleaner` is a function used to join a generated chain of tokens together - it's the last thing run on a generated fragment before it's returned. By default, it just joins the array with `' '`.


`isStarter` is a function used to fill the list of possible fragment starting keys stored in the dictionary. The `key` argument is the sequence of tokens currently being used, joined by the joiner - the `index` is their index in the chunk of text passed to `addText`. It should return a boolean based on whether or not that fragment is desired as the seed for any fragments.
For example, with all other options at their defaults, and a text fragment of "Hello, how are you?", the first pass through `isStarter` would have the "Hello, how" as it's `key` argument.
By default, it returns `!!key.match(/^[A-Z]/)`, which is obviously fairly sloppy (proper nouns lol). If you feed the Blather object statement by statement, rather than a full block of text all at once, I'd recommend going with `index === 0`.

(Wow, I am not explaining that well. Sorry? Maybe later.)

