# Directory Structure

All commands go into the `commands` folder in their own folder with a `package.json` and the command file.
Look at the `package.json` for other commands to see the structure of them.

Any modules that are used by several commands/the main bot/whatever, go into the `lib` folder.

`data` is used for any data files by various commands, bot, etc.

`logs` is for the logs output by pm2.

## Creating Commands

Information on properly creating commands for the bot can be found [here](https://github.com/awau/Clara/wiki).

# Code Styling

To fit in with the 'theme' of the bot, please use any ES6 features where possible/needed, e.g. arrow functions, template strings, promises, etc.
Remember, arrow functions don't change `this`, so if for some reason you need `this` changed, eg. using a library which does so, then you'll need to use the regular `function() {}`.

### Indents

for ctx messages/Promise chaining make sure to do 

```js 

ctx.msg.channel.createMessage().then(resolve).catch(err);
```
or 

```js

ctx.msg.channel.createMessage().then(() => {
    //code awau
}).catch(reject);
```

Avoid using this type of indents for messages 
```js 

ctx.msg.channel.createMessage()
.then(resolve)
.catch(reject)
```

For Curlies, please make it a space after a statement 
```js
function () {
    
}
```
Avoid curlies that is a line after the statement
```js
function ()
{
    
}
```
semi as possible. Using a linter like ESLint helps.


Also, please make sure to follow the way that the code in the repository is set out for consistency.

# Pull Requests

PRs are only accepted in the ``development``branch. if you PR to ``master``, it will be closed.

# Code Verification

We use CodeClimate for code coverage. If your code falls below A, it would not be merged.

# Docker CI

We use CircleCI to test if the Dockerfile can build. If you edited the Dockerfile and it fails, your PR would not be merged.
