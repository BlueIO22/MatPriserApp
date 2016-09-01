var express = require('express');
var cookieParser = require('Cookie-Parser');
var bodyParser = require('Body-Parser');
var mysql = require('mysql');
var router = express.Router();
var app = express();
var fs = require('fs');
var waterfall = require('async-waterfall');
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8087);
var socket = "";


app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

/* Connection for MySql and parameters */
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

connection.connect();

connection.query('USE matpriser');

io.on('connection', function (sockete) {
   socket = sockete;
});

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

router.post('/getProdukter', function(req, res){

    var obj = [];

    waterfall([
        function getproducts(callback){
           connection.query('select * from types', function(err, rows){
             if(err){
               err;
             }
              if(rows.length!==0){
                 for(var i = 0; i<rows.length; i++){
                   var type = rows[i].id;
                   var name = rows[i].name;
                   var id = rows[i].id;

                   callback(null, {name: name, type: type, id: id});
                 }
              }
              return;
           });
        },
        function getCount(item, callback){
            connection.query('select count(*) AS ct from products where typeid="' + item.type + '"', function(err, row){
                  callback(null, {count: row[0].ct, name: item.name, type: item.type, id:item.id});

            });
        }

    ], function(err, result){
      if(err){
         console.log(err);
      }
      console.log("hello");
      socket.emit('sendData', result)
    });
});

router.post('/getCategory', function(req, res){
   var obj = [];
   var id = req.body.id;
   connection.query('select * from products where typeid=' +  id, function(err, rows){
     if(rows.length !== 0){
       for(var i = 0; i<rows.length; i++){
         var name = rows[i].name;
         var type = rows[i].typeid;
         var price = rows[i].price;

         obj.push({name: name, type: type, price: price});
       }
     }
     res.send(obj);
   });
});


router.post('/getProdukterFromSearch', function(req, res){

  var obj = [];
  connection.query('select * from products where name LIKE "%' + req.body.name + '%" ORDER BY id ASC', function(err, rows){
      if(rows.length != 0){
        for(var i = 0; i<rows.length; i++){

           var name = rows[i].name;
           var type = rows[i].type;
           var price = rows[i].price;

           obj.push({name: name, type: type, price: price});
        }
      }
          res.send(obj);

  });
});
module.exports = router;
