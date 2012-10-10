var schema = require("linkfilter/model/schema");

var User = schema.define('users', {
	username:		{ type: String, length: 25, index: true }
});

User.validatesPresenceOf("username");
User.validatesUniquenessOf("username", { message: "username is not unique" });

module.exports = User;


