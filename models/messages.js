var schema = require("./schema"),
	users = require("./users"),
	async = require("async");

var messages = schema.define("messages", {
	username:		{ type: String, length: 50 },
	body:			{ type: String },
	datestamp:		{ type: Date },
	user_id:		{ type: Number },
	to_user_id:		{ type: Number }
});

messages.last = function(n,user_id,cb) {
	messages.all({ 'where': { 'to_user_id': user_id }, 'order': 'id desc', 'limit': n }, cb); 
}

module.exports = messages;
