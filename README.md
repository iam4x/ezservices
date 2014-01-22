EZservices
-------------

Install: `npm install -g ezservices`

Usage: ezservices [start|stop|ls]

You don't have to write the full name and path of the LaunchAgents,
```launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist```
will become
```ezservices start mongodb```

Example:
  + ezservices start php
  + ezservices ls
  + ezservices stop all
