
/**
 * Module dependencies.
 */

var config = require('./config')
  , express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , http = require('http')
  , path = require('path')
  , auth = require('connect-auth')
  , io = require('socket.io').listen(8080)
  , MySQLSessionStore = require('connect-mysql-session')(express);

var app = express();

io.sockets.on('connection',function(socket) {
	socket.on('message', function(data) {
		console.log("Received");
		console.log(data);
		socket.broadcast.emit('message', data);
	});
});

app.configure(function() {
	app.set('port', process.env.PORT || config.app.port || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'hjs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(config.app.cookieSecret));
	app.use(express.session({ 
		store: new MySQLSessionStore(config.db.database, config.db.username, config.db.password, {}),
		secret: config.app.cookieSecret 
	}));
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
app.get('/login', login.index);
app.post('/login/signup', login.signup);
app.post('/login/signin', login.signin);
app.get('/login/edit', login.edit);
app.post('/login/edit', login.edit);
app.get('/login/facebook', login.facebook);
app.get('/login/twitter', login.twitter);
app.get('/login/check-username/:username', login.checkUsername);
app.get('/login/check-email/:email', login.checkEmail);
app.get('/logout', login.logout);

http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
