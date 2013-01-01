var async = require("async"),
	bcrypt = require("bcrypt"),
	users = require("../models/users"),
	accounts = require("../models/external-accounts");

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
				cb(req,res);
			}
		}
	});
}

function facebookAuthenticated(req, res) {
	var details = req.getAuthDetails();
	var user = details.user;

	console.log(user);

	console.log("Ensuring user");

}

function twitterAuthenticated(req, res) {
	var details = req.getAuthDetails();
	var user = details.user;

	console.log(user);

}

function getUniquenessChecker(key) {
	return function(req, res, next) {
		if (!req.param(key))
			return res.json(400, { 'error': key + ' is required' });

		var where = {};
		where[key] = req.param(key);

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
	console.log("exports.facebook");

	if (req.isAuthenticated()) {
		console.log("isAuthenticated");
		//res.redirect(global.config.app.url);
		facebookAuthenticated(req, res);
	}
	else {
		console.log("loginWith");
		loginWith("facebook", req, res, next);
	}
};


exports.twitter = function(req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect(global.config.app.url);
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
		if (err) {
			res.json(400, { 'errors': user.errors });
		}
		else {
			req.session.user = user;
			res.json(200, user);
		}
	});
};

exports.checkUsername = getUniquenessChecker('username');
exports.checkEmail = getUniquenessChecker('email');

exports.index = function(req, res){
	res.render('login', { title: 'Login' });
};

