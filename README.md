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


TODO
-------------

Add `install` command, to install new LaunchAgents. Usefull when you have installed new package with Homebrew for example.


About
-------------

Maxime Tyler, [@iam4x](http://twitter.com/iam4x), [www.iam4x.fr](http://iam4x.fr)
