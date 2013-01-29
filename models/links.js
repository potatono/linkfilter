var schema = require('./schema'),
	users = require('./users');

var links = schema.define("links", {
	url:			{ type: String, length: 255 },
	title:			{ type: String, length: 100 },
	image_ur:		{ type: String, length: 255 },
	description:	{ type: String },
	datestamp:		{ type: Date },
	user_id:		{ type: Number }
});

module.exports = links;
