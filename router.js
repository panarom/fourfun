const fs = require('fs');
const path = require('path');

const ROUTES = {};

function throwUnlessNotFoundException(e) {
  console.log(`e.code ${e.code}`); //TODO: delete
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
  console.log(`dir ${dir}`); //TODO: delete
  fs.readdirSync(dir)
    .forEach((file)=>{
      var relativePath = path.join(dir,file);
        console.log(`relativePath ${relativePath}`); //TODO: delete
      fs.stat(relativePath,
              statCallbackFileClosure(relativePath));
    });
};
function requireRoutes(stats, directoryPath) {
  console.log(`isDir: ${stats.isDirectory()}	directoryPath: ${directoryPath}`); //TODO: delete
  if(stats.isDirectory()) {
    try {
      var leadingDotRelativePath = `.${path.sep}${directoryPath}`;
      console.log(`require ${leadingDotRelativePath}${path.sep}routes.js`); //TODO: delete
      var r = require(`${leadingDotRelativePath}${path.sep}routes.js`);
      console.log(`r-keys: required routes ${Object.keys(r)}`); //TODO: delete
      var basename = path.basename(directoryPath);
      console.log(`directoryPath ${directoryPath}	basename: ${basename}`); //TODO: delete
      var defaultIndex = defaultIndexClosure(basename);
      leadingDotRelativePath.split(path.sep).slice(0,-1)
        .reduce((p,n) => p[findKeyRegExpMatch(p,n)],
                ROUTES)[basename] = defaultIndex || r;
      retrieveRoutes(directoryPath);
    } catch(e) {
      console.log(`requireRoutes exception ${e.code} ${e.message}`); //TODO: delete
      throwUnlessNotFoundException(e);
    }
  }
};
retrieveRoutes('.');

function route(pathArray, request, response) {
  console.log(`pathArray: ${JSON.stringify(pathArray)}`); //TODO: delete
  pathArray.reduce((p,n,i) => {
    console.log(`n: ${n}`);//TODO: delete
    console.log(`i: ${i}`);//TODO: delete
    console.log(`keys: ${Object.keys(p)}`);//TODO: delete
    var match = findKeyRegExpMatch(p,n);
    if(match) {
      if(i + 1 == pathArray.length) {
        try {
          var result = p[match](request, response);
          console.log(`call it: ${result}`); //TODO: delete
          if(result) response.end(result);
        } catch(e) {
          throw(404);
        }
      } else {
        console.log(`match ${match}, keys ${Object.keys(p)}`); //TODO: delete
        return p[match];
      }
    } else {
      throw(404);
    }
  },
                   ROUTES);
}
route.ROUTES=ROUTES; //TODO: delete
module.exports = route;
