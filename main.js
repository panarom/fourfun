var server = require('./server.js');
var router = require('./router.js');
//var persistence = require('./persistence.js');

//console.log(JSON.stringify(router.retrieveRoutes()));
server.start(router.retrieveRoutes(), router.router);
