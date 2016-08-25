var express = require('express');
var cookieParser = require('Cookie-Parser');
var bodyParser = require('Body-Parser');
var router = express.Router();
var app = express();
var fs = require('fs');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/* GET home page. */
router.get('/', function(req, res, next) {
  var obj = readJSONFile('public/json/design.json');
  res.render('index', obj.program );
});

router.get('/index', function(req, res, next){

  var obj = readJSONFile('public/json/design.json');
  res.render('index', obj.program );
});

function readJSONFile(filepath) {
  var file = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(file);

}

module.exports = router;
