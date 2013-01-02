require("../../config");
var schema = require("../../models/schema");
require("../../models/users");
require("../../models/credentials");

schema.automigrate(function() {
	schema.client.end();
});
