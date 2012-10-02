
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , http = require('http')
  , path = require('path')
  , auth = require('connect-auth')
  , config = require('./config');

var app = express();

app.configure(function() {
	app.set('port', process.env.PORT || 80);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'hjs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(config.app.cookieSecret));
	app.use(express.session());
	app.use(auth({
		strategies: [ 
			auth.Anonymous(),
			auth.Twitter({ consumerKey: config.auth.twitter.id, consumerSecret: config.auth.twitter.secret }),
			auth.Facebook({ appId: config.auth.facebook.id, appSecret: config.auth.facebook.secret, scope: "email", callback: config.auth.facebook.callback })
		],
		trace: true
	}));
	app.use(app.router);
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/login/facebook', login.facebook);
app.get('/login/facebook_callback', login.facebookCallback);
app.get('/login/twitter', login.twitter);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
