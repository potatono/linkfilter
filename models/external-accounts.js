var schema = require("./schema"),
	users = require("./users"),
	async = require("async");

var accounts = schema.define('external_accounts', {
	site:			{ type: String, length: 25, index: true },
	external_id:	{ type: String, length: 100, index: true },
	details:		{ type: schema.Text }
});

users.hasMany(accounts, { as: 'accounts', foreignKey: 'users_id' });
accounts.belongsTo(users, { as: 'user', foreignKey: 'users_id' });

