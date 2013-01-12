var schema = require("./schema"),
	async = require("async"),
	bcrypt = require("bcrypt"),
	sloppy = require("../util/sloppy"),
	extend = require("node.extend");

var users = schema.define('users', {
	username:		{ type: String, length: 25, index: true },
	email:			{ type: String, length: 50, index: true },
	password:		{ type: String, length: 100 },
	source:			{ type: String, length: 20 },
	external_id:	{ type: String, length: 20 },
	requires_update:{ type: Boolean }
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
				cb("No users found matching the username " + username);
			}
			else if (results.length > 1) {
				cb("Found more than one user matching the username " + username);
			}
			else {
				cb(null, results[0]);
			}
		},

		function(user, cb) {
			bcrypt.compare(password, user.password, function(err,result) { 
				if (result)
					cb(null, user);
				else
					cb("Password does not match");
			});
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


// Used by 3rd party auth
users.xauth = function(data, cb) {
	async.waterfall([
		// Try to find a user with this external source and id.
		function(cb) {
			users.all({ 'where': { 'source': data.source, 'external_id': data.external_id } }, cb);
		},

		function(results, cb) {
			// If there are no results try to add the user
			if (!results || results.length == 0) {
				data.requires_update = true;
				users.signup(data, function(err, user) {
					// If we got a name conflict just randomize and try again.
					if (err == "Error: Validation error") {
						if (sloppy.get(user,"user.errors.username[0]") == "username is not unique") {
							data.username = data.username + Math.floor(Math.random()*1000);
							users.xauth(data, cb);
							return;
						}
						else if (sloppy.get(user,"user.errors.email[0]") == "email is not unique") {
							var parts = data.email.split(/@/);
							data.email = parts[0] + '+' + Math.floor(Math.random()*1000) + '@' + parts[1];
							users.xauth(data,cb);
							return;
						}
						else {
							cb(err,users.errors);
						}
					}
					else {
						cb(err,user);
					}
				});
			}
			// Otherwise we're done
			else {
				cb(null, results[0]);
			}
		}
	], cb);
};

users.update = function(id, data, cb) {
	async.waterfall([
		function(cb) {
			users.find(id, cb);	
		},

		function(user, cb) {
			console.log(user);
			console.log(data);
			sloppy.extend(user, data);
			console.log(user);
			user.save(cb);
		}
	],

	cb);
}

module.exports = users;

