// Sloppy gets a path that may or may not exist in obj.
function get(obj, path, alt) {
	try {
		// Super slop, make sure we're referencing obj and not the name of whatever we passed in.
		path = path.replace(/^\w+/,"obj");
		var value = eval(path);
		return value;
	}
	catch (e) {
		return typeof(alt) == "undefined" ? null : alt;
	}
}

function filter(obj, keys) {
	keys = (typeof(keys) == "string") ? keys.split(/\s*,\s*/) : keys;
	var result = {};
	keys.forEach(function(key) { result[key] = typeof(obj) == "function" ? obj(key) : obj[key]; });
	return result;
}

function params(req, keys) {
	keys = (typeof(keys) == "string") ? keys.split(/\s*,\s*/) : keys;
	var result = {};
	keys.forEach(function(key) { result[key] = req.param(key); });
	return result;
}

function extend(dest, src) {
	Object.keys(src).forEach(function(key) { dest[key] = src[key] });
	return dest;
}

module.exports.get = get;
module.exports.filter = filter;
module.exports.params = params;
module.exports.extend = extend;

