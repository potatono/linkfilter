var schema = require("linkfilter/model/schema");
var User = require("linkfilter/model/User");

var Credential = schema.define('credentials', {
	method:		{ type: String, length: 25, index: true },
	secret:		{ type: String, length: 100 }
});

User.hasMany(Credential, { as: 'credentials', foreignKey: 'users_id' });
Credential.belongsTo(User, { as: 'user', foreignKey: 'users_id' });

