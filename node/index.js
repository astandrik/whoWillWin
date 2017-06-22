var config = require("../config");
var express = require('express')
  , app = express()
  , port = config.ports.app
  ,https = require('https'),
  http = require('http'),
  fs= require('fs');
  var path = require('path'),
      httpHelper = require("../httpHelper");
const bodyParse = require('./bodyParse');

app.listen(port, () => {
  console.log("listening on " + port);
})

var fs = require("fs");

app.get("/getfile", (req,res) => {
  let content = fs.readFileSync(path.join(__dirname + "/db.js")).toString();
  res.send(content);
})


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

function randomString(len) {
 var str = [];
 return Array.apply(null, new Array(len)).map(x => String.fromCharCode((Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0)+1) + 'a'.charCodeAt(0)))).join('');
}

app.use(express.static(path.join(__dirname + '/../')));

app.use(function (req, ress, next) {
  let token = req.headers["x-access-token"];
  console.log(token);
  if(~req.originalUrl.indexOf("login") || ~req.originalUrl.indexOf("db/") ) {
    next();
  } else if(~req.originalUrl.indexOf("api")) {
    if(!token) {ress.send("Unauthorized request"); return}
    console.log("checking token on request: node");
    var options = {
      method: "POST",
      port: config.ports.auth,
      headers: {
        "Content-Type": "application/json"
      },
      path: "/checkToken"
    };
    let t = {token};
    httpHelper.makeRequest(options, t).then(data => {
      console.log("auth answered " + data);
      next();
    })
  } else {
    next();
  }
});

app.post("/api/login", (req,ress) => {
  var body = req.body;
  var options = {
    method: "POST",
    port: config.ports.auth,
    headers: {
      "Content-Type": "application/json"
    },
    path: "/login"
  };
  console.log("app server asking to login ", body);
  httpHelper.makeRequest(options, body).then(data => {
    ress.send(JSON.stringify(data));
  })
});

app.post("/api/post", function(req, res) {
  console.log(req.body);
  res.send("sosi");
})



app.get("/api/tasks", function(req,res) {
  var options = {
    method: "GET",
    port: config.ports.dbservice,
    headers: {
      "Content-Type": "application/json"
    },
    path: "/tasks"
  };
  httpHelper.makeRequest(options).then(data => {
    res.send(JSON.stringify(data));
  })
});

app.post("/api/task", function(req, res) {
  var body = req.body;
  var options = {
    method: "POST",
    port: config.ports.dbservice,
    headers: {
      "Content-Type": "application/json"
    },
    path: "/task"
  };
  console.log("app server asking to login ", body);
  httpHelper.makeRequest(options, {task: body}).then(data => {
    res.send(JSON.stringify(data));
  })
});


app.get('/api/proposed', function(req, ress) {
  console.log("request initiated");
  var req = https.get('https://2ch.hk/b/', function(res) {
    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var posts = bodyParse(body.toString());
      ress.send(posts);
      // ...and/or process the entire body here.
    })
  });
  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });
});

app.get('/db/dbcreate', function(req,ress) {
  http.get("http://127.0.0.1:" + config.ports.dbservice + "/dbcreate", function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      console.log(body);
      ress.send("db created\n");
    });
    res.on("error", function(e) {
      ress.send(e);
    })
  });
});

app.get('*', function (req, res) {
 res.sendFile(path.join(__dirname + '/../index.html'));
});


