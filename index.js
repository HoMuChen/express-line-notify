const url = require('url');
const https = require('https');
const querystring = require('querystring');

const { do_redirect, run_request } = require('./utils');

const lineNotification = (config) => (req, res, next) => {
	const request_url = url.parse(req.url, true);
	const return_url = url.format({ protocol: 'https', host: req.headers.host, pathname: request_url.pathname })
	const code = request_url.query && request_url.query.code;
	const state = request_url.query && request_url.query.state;
	const error = request_url.query && request_url.query.error;

	if(error) {
		const description = request_url.query.error_description || error;
		return next(new Error(description));
	}

	if(!code) {
		do_redirect( res, make_acquire_url(config, return_url) );
	}

	if(code) {
		run_request( make_token_request(config, code, return_url) )
			.then(data => {
				const info = JSON.parse(data);
				const accessToken = info && info.access_token;
				return accessToken;
			})
			.then(accessToken => {
				req['line-notify-access-token'] = accessToken;
				next();
			})
			.catch(e => {
				return next(e);
			})
	}
}

const make_acquire_url = (config, redirect_uri) =>
  url.format({ protocol: 'https',
               host: 'notify-bot.line.me',
               pathname: '/oauth/authorize',
               query: { response_type: 'code', client_id: config.clientId, redirect_uri, scope: 'notify', state: 'tmp_state' } });

const make_token_request = (config, code, redirect_uri) => {
  const req = https.request({ method: 'POST', host: 'notify-bot.line.me', path: '/oauth/token',
                              headers: { 'Content-type': 'application/x-www-form-urlencoded' } });
  req.write(querystring.stringify({
      client_id: config.clientId, redirect_uri, client_secret: config.clientSecret, code,
      grant_type: 'authorization_code'
    }));
  return req;
};

module.exports = lineNotification;
