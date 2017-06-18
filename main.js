var server = require('./server.js');
var router = require('./router.js');
//var validator = require('./validator.js');
//var persistence = require('./persistence.js');

server.start(router/*, validator*/);
