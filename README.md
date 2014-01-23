EZservices
-------------

A wrapper for launchctl, inspired by the gem [lunchy](https://github.com/mperham/lunchy).

Why **EZservices** ? Because lunchy can't star/stop/restart severals LaunchAgents at the same time,
you need to run severals commands to acheive this.

(from lunchy description)
Don't you hate OSX's launchctl? You have to give it exact filenames.
The syntax is annoying different from Linux's nice, simple init system and overly verbose.
It's just not a very developer-friendly tool.

Instead of using this:

``launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist``

you can do this:

``ezservices start mongodb``

and:

```
> ezservices ls

~/Library/LaunchAgents/homebrew-php.josegonzalez.php55.plist
~/Library/LaunchAgents/homebrew.mxcl.elasticsearch.plist
~/Library/LaunchAgents/homebrew.mxcl.memcached.plist
~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
~/Library/LaunchAgents/homebrew.mxcl.nginx-full.plist
```

But the power of **EZservices** is to start or stop severals LaunchAgents at the same time :

```
> ezservices start mongodb mysql elasticsearch

mongodb correctly started.
mysql correctly started.
elasticsearch correctly started.
```


Installation
-------------

Install `npm cli` that comes with [nodejs](http://nodejs.org/) if it's not already done.

Then simply run `npm install ezservices -g` and you're done!


Usage
-------------

**The availables commands are:**
*(If all keyword is used, it will perform the operation on all availables services)*

* `ezservices start [services | all]` starts the given services
* `ezservices stop [services | all]` stops the given services
* `ezservices restart [services]` restart the given services
* `ezservices ls | list` list all the availables services
* `ezservices show [services | all]` give the path of the given LaunchAgents
* `ezservices status [services]` give the status of the given LaunchAgents, **all keyword is not working yet**
* `ezservices install [file]` install the given file as a LaunchAgents
* `ezservices remove [service]` remove the given service from LaunchAgents


TODO
-------------

* Some refactoring.
* More use of nodejs instead of bash command.
* Add edit command.


About
-------------

Maxime, [@iam4x](http://twitter.com/iam4x), [www.iam4x.fr](http://iam4x.fr)


License
-------------

The MIT License (MIT)

Copyright (c) 2013 Maxime Janton, maxime.janton@supinfo.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
