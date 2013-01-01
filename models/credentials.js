var schema = require("linkfilter/model/schema"),
	users = require("linkfilter/model/users"),
	bcrypt = require("bcrypt"),
	async = require("async");

var credentials = schema.define('credentials', {
	method:		{ type: String, length: 25, index: true },
	secret:		{ type: String, length: 100 }
});

users.hasMany(credentials, { as: 'credentials', foreignKey: 'users_id' });
credentials.belongsTo(users, { as: 'user', foreignKey: 'users_id' });

credentials.findByMethodSecret = function(method, secret, cb) {
	async.waterfall([
		function(cb) {
			bcrypt.hash(secret, 10, cb);
		},

		function(hash, cb) {
			credentials.all({ 'where': { 'method': method, 'secret': hash } }, cb);
		}
	],

	cb);
};

credentials.ensureUser = function(username, email, method, secret, cb) {
	console.log("in ensure user");
	async.waterfall([
		function(cb) {
			credentials.findByMethodSecret(method, secret, cb);
		},

		function(credentials, cb) {
			if (credentials.length == 0) {
				users.create({ 'username':username, 'email':email }, cb);
			}
			else if (credentials.length == 1) {
				credentials[0].user(cb);
			}
			else {
				throw new Error("More than one credential match");
			}
		}
	],

	cb);
};

module.exports = credentials;
