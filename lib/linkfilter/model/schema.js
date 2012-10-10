var Schema = require("jugglingdb").Schema;

global.schema = module.exports = new Schema(global.config.db.engine,global.config.db);
global.schema.on('log', console.log);
