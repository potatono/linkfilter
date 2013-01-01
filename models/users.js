var schema = require("./schema"),
	async = require("async"),
	bcrypt = require("bcrypt");

var users = schema.define('users', {
	username:		{ type: String, length: 25, index: true },
	email:			{ type: String, length: 50, index: true },
	password:		{ type: String, length: 50 }
});

users.validatesPresenceOf("username", { message: "username is required" });
users.validatesPresenceOf("password", { message: "password is required" });
users.validatesPresenceOf("email", { message: "email is required" });
users.validatesUniquenessOf("username", { message: "username is not unique" });
users.validatesUniquenessOf("email", { message: "email is not unique" });

users.signin = function(username, password, cb) {
	async.waterfall([
		function(cb) {
			users.all({ 'where': { 'username': username } }, cb);
		},

		function(results, cb) {
			if (!results || results.length == 0) {
				throw new Error("No users found matching the username " + username);
			}
			else if (results.length > 1) {
				throw new Error("Found more than one user matching the username " + username);
			}
			else {
				cb(results[0]);
			}
		},

		function(user, cb) {
			bcrypt.compare(password, user.password, function(err,result) {  cb(err,user,result); });
		},

		function(user, result, cb) {
			if (result)
				cb(user);
			else
				throw new Error("Password does not match");
		}
	], 
	
	cb);
};

users.signup = function(data, cb) {
	async.waterfall([
		function(cb) {
			bcrypt.genSalt(10, cb);
		},

		function(salt, cb) {
			bcrypt.hash(data.password, salt, cb);
		},

		function(hash, cb) {
			data.password = hash;

			users.create(data,cb);
		}
	],

	cb);
};

module.exports = users;

