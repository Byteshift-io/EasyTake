var express = require('express');
var connection = require('./connectionFactory/connectionInstance');
var sqllib = require('./sql');
var app = express();
var bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var multer  =   require('multer');

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
  	fileName=file.fieldname + '-' + Date.now()+"."+file.originalname;
    callback(null, fileName);
  }
});
var upload = multer({ storage : storage});
var employeeupload = multer({ storage : storage});
connection.connect(function(error){
	console.log(error);
});
var errObj={
	errorId:"jknfrjfnref",
	errorInvalidMsg:"Invalid Input",
	errorServerMsg:"Something went wrong. Please try again"
};
/*
2xx = Success
4xx = Client Side error
5xx = Server error
*/

app.get('/', function (req, res) {	
	console.log("In");
})
/* Sign in */
app.post('/SignIn', function (req, res) {
	var Mobile=req.body.Mobile;
	var OTP=req.body.OTP;	
	var Type=req.body.Type;
	var sql='';	
	if(Type=="EMPLOYEE"){
		sql=sqllib.SelectQueries.EmployeeSignIn;
	}else{
		sql=sqllib.SelectQueries.EmployerSignIn;
	}
	let ValidateMobile = function(){
		return new Promise(function(resolve,reject){
				connection.query({
					sql: sql,
					timeout: 120000, // 120s
					values: Mobile
				}, function (error, results) {
					  if (error){
					  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});
					  	 reject();					  	 	
					  }else{
					  	 if(results.length>0){
					  	 	if(OTP=="123456"){
					  	 		 resolve(results[0]); 	 		 
					  	 	}else{
					  	 		res.status(401).json({"success":0,"msg":"Invalid OTP"});
					  	 		reject();
					  	 	}
					  	 }else{
					  	 	res.status(401).json({"success":0,"msg":errObj.errorInvalidMsg});
					  	 	reject();
					  	 }
					  	 		
					  }		    
				});				
		});	
	};
	let SaveToken = function(ValidateMobileMsg){
		var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var tok=ValidateMobileMsg.id+"_";
		for (var i = 6; i > 0; --i) {
		 	tok += chars[Math.floor(Math.random() * chars.length)];
		}
		connection.query({
			sql: sqllib.InsertQueries.LoggedTable,
			timeout: 120000, // 120s
			values: [ValidateMobileMsg.id,Type,tok]
		}, function (error, results) {
			  if (error){
			  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});					  	 	
			  }else{
			  	 res.status(200).json({"success":1,"details":ValidateMobileMsg,"token":tok,"msg":"Successfully logged in"});
			  }		    
		});			
	}; 

	ValidateMobile().then(function(ValidateMobileMsg){		
		return SaveToken(ValidateMobileMsg);
	}).catch(function(catchmsg){
		console.log(catchmsg);
	});
	
	//connection.end();
})
/* employer API */
var employerUpload = upload.fields([{ name: 'AadharAttachment', maxCount: 1 }, { name: 'GstAttachment', maxCount: 1 }])
app.post('/EmployerSignup', employerUpload, function (req, res, next) {
	if(!req.files.AadharAttachment){
		res.status(401).json({"success":0,"msg":"Aadhar attachment not uploaded"});	
	}else if(!req.files.GstAttachment){
		res.status(401).json({"success":0,"msg":"GST attachment not uploaded"});
	}else{
		var Name=req.body.Name;
		var Role=req.body.Role;
		var Phone=req.body.Phone;
		var AlernatePhone=req.body.AlernatePhone;
		var OfficialMail=req.body.OfficialMail;
		var AadharNum=req.body.AadharNum;
		var AadharAttachment=req.files.AadharAttachment[0].filename;
		var CompanyName=req.body.CompanyName;
		var BusinessType=req.body.BusinessType;
		var Mail=req.body.Mail;
		var City=req.body.City;
		var Location=req.body.Location;
		var GSTIN=req.body.GSTIN;
		var GstAttachment=req.files.GstAttachment[0].filename;
		let ValidateUniqueEmployer = function(){
				return new Promise(function(resolve,reject){
					connection.query({
						sql: sqllib.SelectQueries.EmployerValidate,
						timeout: 120000, // 120s
						values: [City,Location,AadharNum]
					}, function (error, results) {
						  if (error){
						  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});
						  	 reject();					  	 	
						  }else{
						  	 if(results.length>0){
						  	 	res.status(401).json({"success":0,"msg":"Location, city and aadhar number already registered"});
						  	 	reject();
						  	 }else{
						  	 	resolve(); 	 	
						  	 }						  	 		
						  }		    
					});				
				});	
		};
		let SaveInformation = function(){
				connection.query({
					sql: sqllib.InsertQueries.EmployerSignup,
					timeout: 120000, // 120s
					values: [Name,Role,Phone,AlernatePhone,OfficialMail,AadharNum,AadharAttachment,CompanyName,BusinessType,Mail,City,Location,GSTIN,GstAttachment]
				}, function (error, results) {
					  if (error){
					  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});	
					  }else{
					  	 res.status(200).json({"success":1,"lastid":results.insertId,"msg":"Successfully submitted"});		
					  }
					    
				});
		}; 
		ValidateUniqueEmployer().then(function(){		
			return SaveInformation();
		}).catch(function(catchmsg){
			console.log(catchmsg);
		});
	}		
	//connection.end();
})


/* employee API */
var employeeUpld = employeeupload.single('Photo');
app.post('/EmployeeSignup', employeeUpld, function (req, res, next) {
	console.log(req);
	if(!req.file){
		res.status(401).json({"success":0,"msg":"Photo not uploaded"});	
	}else{
				var Name=req.body.Name;
				var Email=req.body.Email;
				var Phone=req.body.Phone;
				var AadharNum=req.body.AadharNum;
				var Occupation=req.body.Occupation;
				var Photo=req.file.filename;
				var Location=req.body.Location;
				var Language=req.body.Language;
				var ReferralCode=req.body.ReferralCode;
				var AccNum=req.body.AccNum;
				var AccName=req.body.AccName;
				var IFSC=req.body.IFSC;
				var BankName=req.body.BankName;
				var PtmNum=req.body.PtmNum;
				var TezNum=req.body.TezNum;
				
				connection.query({
					sql: sqllib.InsertQueries.EmployeeSignup,
					timeout: 120000, // 120s
					values: [Name,Email,Phone,AadharNum,Occupation,Photo,Location,Language,ReferralCode,AccNum,AccName,IFSC,BankName,PtmNum,TezNum]
				}, function (error, results) {
					  if (error){
					  	res.status(501).json({"success":0,"msg":errObj.errorServerMsg});	
					  }else{
					  	res.status(200).json({"success":1,"lastid":results.insertId,"msg":"Successfully submitted"});		
					  }		  
				});
	}
	//connection.end();
})
app.get('/AllEmployee', function (req, res) {	
	connection.query({
		sql: sqllib.SelectQueries.AllEmployee,
		timeout: 120000
	}, function (error, results, fields) {
		  if (error){
		  	res.status(501).json({"success":0,"msg":errObj.errorServerMsg});	
		  }else{
		  	res.status(200).json({"success":1,"employees":results});		
		  }	
	});
	connection.end();
})


/*app.post('/api/photo', cpUpload, function (req, res, next) {
	if(!req.files.AadharAttachment || !req.files.GstAttachment){
		res.end("Error uploading file.");
	}else{
		console.log(req.files);
	}	
})*/

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})