var http = require('http');
var url = require('url');

var DEFAULT = {contentType: 'text/html',
               responseCode: 200};

var parsePathname = function(pathname) {
  return pathname
    .replace(new RegExp('^'), '.')
    .replace(new RegExp('/$'), '')
    .split('/');
}

var generateResponse(result) {
  var responseObject = (result.toString() === result) ?
      {content: result} :
      result;
  Object.keys(DEFAULT)
    .forEach((k) => {if(!(k in responseObject)) responseObject[k] = DEFAULT[k];});

  return responseObject;
}
var routerClosure = function(routes, router) {
  return (req, res) => {
    var pathArray = parsePathname(url.parse(req.url, true).path);

    var ret = router(pathArray, req, routes);
    var resp = generateResponse(ret);

    res.writeHead(resp.responseCode, {'Content-Type': resp.contentType});
    res.end(resp.content);
  }
}

Object.assign(module.exports,
              {start: (routes, router) => http
               .createServer(routerClosure(routes, router)).listen(8080),
               parsePathname: parsePathname}
              });
