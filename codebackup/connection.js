var express = require('express');
var mysql = require('mysql');
var connection = mysql.createConnection({
// properties...
		host:'localhost',
		user:'root',
		password:'',
		database:'easytake'
});
var app = express();
var bodyParser= require('body-parser');
connection.connect(function(){
	if(!!error){
		console.log("error");
	}else{
		console.log("connected");
	}
});
app.use(bodyParser.json());

var errObj={
	errorId:"jknfrjfnref",
	errorMsg:"Invalid Request"
};
/*
2xx = Success
4xx = Client Side error
5xx = Server error
*/
app.get('/', function (req, res) {
	var obj={
		username:"abcd",
		jobs_completed:[
		"4ifuh83h",
		"3dn3fi3fi"
		]
	};
	connection.query("select * from employee",function(error,rows,fields){
			if(!!error){
				console.log("error in the query");
			}else{
				console.log("query executed",rows[0]);
			}
	});
   //res.json(obj);
})
app.post('/login', function (req, res) {
	var username=req.body.userid;
	var password=req.body.password;

	if(username == 'undefined'|| username==null){
		res.status(403).json(errObj);
	}
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})