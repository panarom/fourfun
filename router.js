const fs = require('fs');
const path = require('path');

const ROUTES = {};

function throwUnlessNotFoundException(e) {
  switch(e.code) {
  case 'MODULE_NOT_FOUND':
  case 'ENOENT':
    break;
  default:
    throw(e);
    break;
  }
}

function findKeyRegExpMatch(p,n) {
  return Object.keys(p).find(rx => (new RegExp(rx)).test(n));
}

function defaultIndexClosure(directory) {
  try {
    var html = fs.readFileSync(
      path.join(directory,
                'index.html')
    );

    return (request, response) => html;
  } catch(e) {
    throwUnlessNotFoundException(e);
    return false;
  }  
}

var app_root = defaultIndexClosure('.') || ((req, rsp) => 'welcome');
try {
  Object.assign(app_root, require('routes.js'));
} catch(e) {
  throwUnlessNotFoundException(e);
}
ROUTES['\\.'] = app_root;

function statCallbackFileClosure(file) {
  return function(err, stats) {
    if(err) {
      console.log(err);
      process.exit(1);
    } else {
      requireRoutes(stats, file);
    };
  }
}
function retrieveRoutes(dir) {
  fs.readdirSync(dir)
    .forEach((file)=>{
      var relativePath = path.join(dir,file);
      fs.stat(relativePath,
              statCallbackFileClosure(relativePath));
    });
};
function requireRoutes(stats, directoryPath) {
  if(stats.isDirectory()) {
    try {
      var leadingDotRelativePath = `.${path.sep}${directoryPath}`;
      var r = require(`${leadingDotRelativePath}${path.sep}routes.js`);
      var basename = path.basename(directoryPath);
      var defaultIndex = defaultIndexClosure(basename);
      leadingDotRelativePath.split(path.sep).slice(0,-1)
        .reduce((p,n) => p[findKeyRegExpMatch(p,n)],
                ROUTES)[basename] = defaultIndex || r;
      retrieveRoutes(directoryPath);
    } catch(e) {
      throwUnlessNotFoundException(e);
    }
  }
};
retrieveRoutes('.');

function route(pathArray, request, response) {
  pathArray.reduce((p,n,i) => {
    var match = findKeyRegExpMatch(p,n);
    if(match) {
      if(i + 1 == pathArray.length) {
        try {
          var result = p[match](request, response);
          if(result) response.end(result);
        } catch(e) {
          throw(404);
        }
      } else {
        return p[match];
      }
    } else {
      throw(404);
    }
  },
                   ROUTES);
}
module.exports = route;
