var config = require("../../config");
var async = require("async");
var User = require("linkfilter/model/user");

exports.tearDown = function(callback) {
	try { global.schema.client.end(); } catch (e) {}
	callback();
};

exports.testCrud = function(test) {
	var username = "testuser" + Math.floor(Math.random()*100000);

	async.waterfall([
		function(cb) { 
			User.create({ 'username':username },cb);
		},
		function(user,cb) { 
			test.ok(user.id > 0, "User has id after save");

			User.find(user.id,cb);
		},
		function(user,cb) {
			test.equals(username, user.username, "Loaded user and username match");

			user.destroy(cb);
		},
		function(cb) {
			User.all({ where: { 'username':username } },cb);			
		},
		function(matches,cb) {
			test.equals(0,matches.length, "Cannot find user after delete");

			test.done();
		}
	]);
}

