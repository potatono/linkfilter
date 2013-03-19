var config = require("../config"),
	async = require("async"),
	bcrypt = require("bcrypt"),
	users = require("../models/users"),
	sloppy = require("../util/sloppy");

function jamUserIntoSession(req, user) {
	var auth = { 'scopedUsers': {}, 'user':user };
	req._connect_auth = auth;
	req.session.auth = auth;
}

function loginWith(method, req, res, cb) {
	req.authenticate([method], function(error, authenticated) {
		if (error) { 
			res.end();
		}
		else {
			if (authenticated === undefined) {
				// Browser interaction required, do nothing.
			}
			else {
				console.log(cb);
				return cb(req,res);
			}
		}
	});
}

function facebookAuthenticated(req, res) {
	var details = req.getAuthDetails();
	var fb_user = details.user;

	var lf_user = {
		username:	fb_user.username,
		email:		fb_user.email,
		password:	fb_user.id,
		source:		'facebook',
		external_id: fb_user.id
	};

	users.xauth(lf_user, function(err, user) {
		if (err) {
			user = null;
		}

		jamUserIntoSession(req,user);
		res.redirect(config.app.url);
	});
}

function twitterAuthenticated(req, res) {
	var details = req.getAuthDetails();
	var twitter_user = details.user;

	var lf_user = {
		username:	twitter_user.username,
		email:		twitter_user.username + '@twitter.com',
		password:	twitter_user.user_id,
		source:		'twitter',
		external_id: twitter_user.user_id
	};

	users.xauth(lf_user, function(err, user) {
		if (err) {
			user = null;
		}

		jamUserIntoSession(req,user);
		res.redirect(config.app.url);
	});
}

function getUniquenessChecker(key) {
	return function(req, res, next) {
		if (!req.param(key))
			return res.json(400, { 'error': key + ' is required' });

		var where = {};
		where[key] = req.param(key);
		if (req.isAuthenticated()) {
			var user = req.getAuthDetails().user;
			where['id'] = { 'neq': user.id };
		}

		users.all(
			{ 'where': where }, 
			
			function(err, results) {
				if (err) {
					res.json(500, { 'errors': err });
				}
				else {
					
					res.json(200, { 'unique': results.length == 0, 'matches': results.length });
				}
			}
		);
	}
};

exports.facebook = function(req, res, next) {
	if (req.isAuthenticated()) {
		facebookAuthenticated(req, res);
	}
	else {
		loginWith("facebook", req, res, next);
	}
};


exports.twitter = function(req, res, next) {
	if (req.isAuthenticated()) {
		twitterAuthenticated(req, res);
	}
	else {
		loginWith("twitter", req, res, twitterAuthenticated);
	}
};

exports.signup = function(req, res, next) {
	users.signup({
		'username': req.param('username'),
		'password': req.param('password'),
		'email':	req.param('email')
	},

	function(err, user) {
		if (err && user.errors !== false) {
			res.json(400, { 'errors': user.errors });
		}
		else {
			jamUserIntoSession(req,user);
			res.redirect(config.app.url);
		}
	});
};

exports.signin = function(req, res, next) {
	users.signin(
		req.param('username'),
		req.param('password'),

		function(err, user) {
			if (err) {
				res.json(400, { 'errors': err });
			}
			else {
				jamUserIntoSession(req,user);
				res.redirect(config.app.url);
			}
		}
	);
};

exports.checkUsername = getUniquenessChecker('username');
exports.checkEmail = getUniquenessChecker('email');

exports.index = function(req, res) {
	res.render('login', { title: 'Login' });
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect(config.app.url);
};

exports.edit = function(req, res) {
	var user = req.isAuthenticated() ? req.getAuthDetails().user : null;

	if (req.method == "POST") {
		users.update(user.id, sloppy.extend(sloppy.params(req,"username,email"), { requires_update: false }), function(err,user) { 
			jamUserIntoSession(req, user);
			res.redirect(config.app.url); 
		});
	}
	else {
		res.render('login-edit', { title: 'Login Edit', user:user });
	}
};


