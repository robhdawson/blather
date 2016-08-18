Blather
====================================

Blather is a little js library for generating text with Markov chains.

###A Simple Example

```javascript
var Blather = require('blather');

var blatherer = Blather();

[
    'I love dogs because they are fun',
    'I love cats because they are chill',
    'I wouldn\'t say I love snakes',
    'I do not care for ants',
    'Honestly, I hate snakes because they are disgusting and weird',
    'Zebras, because they live on a different continent than I do, I am indifferent towards',
    'I am a person with a lot of opinions about animals I love and don\'t love'
].forEach(function(fragment) {
    blatherer.addFragment(fragment);
});

blatherer.generateFragment(); // 'I am a person with a lot of opinions about animals I love snakes' maybe, or anything
```

This is using all the default options.
