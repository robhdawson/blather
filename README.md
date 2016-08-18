Blather
====================================

Blather is a little js library for generating text with Markov chains.

###A Simple Example

```javascript
var Blather = require('blather');

var blatherer = Blather();

var fragments = [
    'I love dogs because they are fun',
    'I love cats because they are chill',
    'I wouldn\'t say I love snakes',
    'I do not care for ants',
    'Honestly, I hate snakes because they are disgusting and weird',
    'Zebras, because they live on a different continent than I do, I am indifferent towards',
    'I am a person with a lot of opinions about animals I love and don\'t love'
];

fragments.forEach(function(fragment) {
    blatherer.addFragment(fragment);
});

blatherer.generateFragment(); // 'I am a person with a lot of opinions about animals I love snakes'
blatherer.generateFragment(); // 'I wouldn't say I love dogs because they are fun'
blatherer.generateFragment(); // 'Honestly, I hate snakes because they are chill'
```

You get the picture. It mangles up the text. Accurately explaining Markov chains is beyond the scope of this README or my capabilities - I just use this to make silly toys and bots.

###More Complicated Examples
Blather is pretty flexible in how it chews up your text fragments, and how it spits it back at you.

####split

`split` is a function that takes a text fragment and splits it into distinct units. By default, it splits only on `/\s+/`, meaning those units are (roughly) words. If you wanted to get more fine-grained than that, though, you could do something like this:

```javascript
var blatherer = Blather({
    split: function(text) {
        return text.split('');
    }
});
```

`split` takes a string and must return an array.

####depth

`depth` controls how many units each step of the Markov generation looks at when determining what unit could possibly come next. By default, it's `2` - higher numbers mean a higher likelihood of exactly replicating source fragments, and lower numbers mean more chance for gibberish.

####clean

`clean` is the last function a generated fragment passes through before coming out. It takes in an array of units and stitches them back together. By default, it just joins using a space, but imagine you were using the custom `split` defined above - you might want to do something like:

```javascript
var blatherer = Blather({
    split: function(text) {
        return text.split('');
    },
    clean: function(textArray) {
        return textArray.join('');
    }
}
});
```

You could also shove custom cleanup logic here if you wanna get fancy - simple grammar checks, punctuation stripping, whatever. As long as it takes in an array of strings and returns a string, you're cool.

####isStart

When adding fragments, Blather stores away certain groups of units as possible fragment-starters. If all your fragments are discrete units of language, like sentences or tweets, the default should do you fine - it just checks if it's the first group of units in the fragment. If you're adding paragraphs at a time, maybe you'd want something closer to this:

```javascript
var blatherer = Blather({
    isStart: function(fragmentPiece, index) {
        return (fragmentPiece[0].toUpperCase() === fragmentPiece[0]);
    }
});
```

This would get you all the starts of sentences with capital letters (and all the proper nouns, too, which is a little sloppy), which might be useful. `fragmentPiece` is a string and `index` is the index of the piece within the fragment being added. The default function here just checks if index is zero.

####joiner

This one's a little silly. If all is well, it shouldn't matter - it's just an implementation detail. As mentioned above, Blather is operating on arrays of units - as split by the `split` function and their length determined by `depth` - but it needs to turn those arrays into strings to use as object keys. `joiner` is the string it uses to join them.

By default, it is `'<|>'`, but if that exact sequence of characters appears anywhere in your source fragments, it's gonna get fudged up. If you're doing weird things, try changing this, I guess - it really shouldn't be part of the public API, but I felt irresponsible leaving it out. Do what you will with this information.









