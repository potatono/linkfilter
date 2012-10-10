require("../../config");
var schema = require("linkfilter/model/schema");
require("linkfilter/model/user");
require("linkfilter/model/credential");

schema.automigrate(function() {
	schema.client.end();
});
