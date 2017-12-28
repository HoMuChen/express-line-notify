# express-jwt

Middleware that authenticates line's oauth and sets `req.line-notify-access-token`.

## Install

    $ npm install express-line-notify

## Usage

The authentication middleware go throught line oauth process.
If success, `req.line-notify-access-token` will be set with the return access_token,
and can be used by later middleware for pushing notification.

For example,

```javascript
var lineNotify = require('express-line-notify');

var config = {
  clientId:      'your-line-notify-client-id',
  clientSecret:  'your-line-notify-client-secret'
}

app.get('/linenotify',
  lineNotify(config),
  function(req, res) {
    const token = req.line-notify-access-token;
    //...
  });
```


## Author

[HoMuchen](b98901052@ntu.edu.tw)
