var config = require("../../config");
var async = require("async");
var user = require("./models/users");

exports.tearDown = function(callback) {
	try { global.schema.client.end(); } catch (e) {}
	callback();
};

exports.testCrud = function(test) {
	var username = "testuser" + Math.floor(Math.random()*100000);

	async.waterfall([
		function(cb) { 
			users.create({ 'username':username, 'email':username+'@example.com' },cb);
		},
		function(user,cb) { 
			test.ok(user.id > 0, "User has id after save");

			users.find(user.id,cb);
		},
		function(user,cb) {
			test.equals(username, user.username, "Loaded user and username match");

			user.destroy(cb);
		},
		function(cb) {
			users.all({ where: { 'username':username } },cb);			
		},
		function(matches,cb) {
			test.equals(0,matches.length, "Cannot find user after delete");

			test.done();
		}
	]);
}

