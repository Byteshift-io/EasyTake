var express = require('express');
var connection = require('./connectionFactory/connectionInstance');
var sqllib = require('./sql');
var md5 = require('md5');
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
	errorTokenMsg:"Access not granted",
	errorServerMsg:"Something went wrong. Please try again"
};
/*
2xx = Success
4xx = Client Side error
5xx = Server error
*/
TokenCheck = function(token){ 
	return new Promise(function(resolve,reject){
			connection.query({
				sql: sqllib.SelectQueries.ValidateToken,
				timeout: 120000, // 120s
				values: token
			}, function (error, results) {
				  if (error){
				  	 reject("Token Not passed"); 	
				  }else{
				  	 if(results.length==0){
						reject(errObj.errorTokenMsg);						
					 }else{
						resolve(results);	
					 }				  	 	
				  }				    
			});		
	});	
};
app.get('/', function (req, res) {			
	console.log("In");
})
/* Sign in */
app.post('/SignIn', function (req, res) {
	var Email=req.body.Email;
	var Mobile=req.body.Mobile;
	var OTP=req.body.OTP;
	var Pwd=req.body.Pwd;	
	var Type=req.body.Type;
	var sql='';	
	var valuesAr;
	if(Type=="EMPLOYEE"){
		sql=sqllib.SelectQueries.EmployeeSignIn;
		valuesAr=[Mobile];
	}else{		
		if(typeof Pwd === "undefined" || Pwd=="" ){
			res.status(400).json({"success":0,"msg":"Password not passed"});
			res.end();
		}else{
			var encodedString = md5(Pwd);
			sql=sqllib.SelectQueries.EmployerSignIn;
			valuesAr=[Email,encodedString];
		}
	}
	let ValidateMobile = function(){
		return new Promise(function(resolve,reject){
				connection.query({
					sql: sql,
					timeout: 120000, // 120s
					values: valuesAr
				}, function (error, results) {
					 //console.log(results);
					  if (error){
					  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});
					  	 reject();					  	 	
					  }else{
					  	 if(results.length>0){
					  	 	if(Type=="EMPLOYEE"){
					  	 		if(OTP=="123456")
					  	 			resolve(results[0]); 
					  	 		else{
					  	 			res.status(401).json({"success":0,"msg":"Invalid OTP"});
					  	 			reject();
					  	 		}

					  	 	}else{
					  	 		resolve(results[0]); 
					  	 	}
					  	 }else{
					  	 	if(Type=="EMPLOYEE"){
						  	 	res.status(401).json({"success":0,"msg":"Incorrect mobile number"});
						  	}else{
						  		res.status(401).json({"success":0,"msg":"Incorrect email or password"});						  	 	
						  	}
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
app.get('/Logout', function (req, res) {	
		var token=req.headers.token;
		//console.log(sqllib.DeleteQueries.DeleteLogged);
		let DeleteFromLogged = function(){		
			connection.query({
				sql: sqllib.DeleteQueries.DeleteLogged,
				timeout: 120000, // 120s
				values: [token]
			}, function (error, results) {
				  if (error){
				  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});			  	 	
				  }else{
				  	 res.status(200).json({"success":1,"msg":"Logged out successfully"});			 						  	 		
				  }		    
			});	
		};
		TokenCheck(token).then(function(tokenResult){
			return DeleteFromLogged();
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});			
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
		var Pwd=req.body.Pwd;
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
		
		var encodedString = md5(Pwd);
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
					values: [Name,Role,Phone,AlernatePhone,OfficialMail,encodedString,AadharNum,AadharAttachment,CompanyName,BusinessType,Mail,City,Location,GSTIN,GstAttachment,"FALSE",0]
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
			res.status(500).json({"success":0,"msg":catchmsg});	
		});
	}		
	//connection.end();
})
/* jobs */
app.post('/CreateJob', function (req, res) {
		var token=req.headers.token;
		var job_title=req.body.job_title;
		var job_description=req.body.job_description;
		var spcl_instruction=req.body.spcl_instruction;
		var job_amt=req.body.job_amt;
		var start_time=req.body.start_time;
		var num_of_employee=req.body.num_of_employee;
		var end_time=req.body.end_time;
		var booking_radius=req.body.booking_radius;
		var pickup_provided=req.body.pickup_provided;
		var quota_cancel=req.body.quota_cancel;
		var createdBy=req.body.createdBy;
		var reporting_time=req.body.reporting_time;
		var reporting_location=req.body.reporting_location;
		var contact_person=req.body.contact_person;
		var pickup_location=req.body.pickup_location;
		var driver_name=req.body.driver_name;
		var driver_phone=req.body.driver_phone;
		
		let CreateNewJob = function(){
				return new Promise(function(resolve,reject){
					connection.query({
						sql: sqllib.InsertQueries.CreateJob,
						timeout: 120000, // 120s
						values: [job_title,job_description,spcl_instruction,job_amt,num_of_employee,start_time,end_time,booking_radius,reporting_time,reporting_location,pickup_provided,quota_cancel,createdBy]
					}, function (error, results) {
						  if (error){
						  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});
						  	 reject();					  	 	
						  }else{
						  	 resolve(results.insertId); 	 						  	 		
						  }		    
					});				
				});	
		};
		let SavePickupDetail = function(job_id){
				connection.query({
					sql: sqllib.InsertQueries.SaveJobPickup,
					timeout: 120000, // 120s
					values: [job_id,contact_person,pickup_location,driver_name,driver_phone]
				}, function (error, results) {
					  if (error){
					  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});	
					  }else{
					  	 res.status(200).json({"success":1,"lastid":job_id,"msg":"Successfully submitted"});		
					  }
					    
				});
		}; 
		TokenCheck(token).then(function(tokenResult){
			return CreateNewJob();
		}).then(function(job_id){
			if(pickup_provided=="TRUE")
				return SavePickupDetail(job_id);
			else
				res.status(200).json({"success":1,"lastid":job_id,"msg":"Successfully submitted"});		
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});
		
})
app.post('/ListJob', function (req, res) {	
		var token=req.headers.token;
		var job_status=req.body.job_status;// for all job this field should be 0	
		var employer_id=req.body.employer_id;// for list of job created by employer for this all other parameters should be 0 
		var employee_id=req.body.employee_id;// for list of job for employee for this all other parameters should be 0 
		var listsql=sqllib.SelectQueries.AllJobs;
		var dataVal=[1];
		if(job_status!=0){
			listsql=sqllib.SelectQueries.JobsByStatus;
			dataVal=[job_status];
		}
		else if(employer_id!=0){
			listsql=sqllib.SelectQueries.JobsByEmployer;
			dataVal=[employer_id];
		}
		//console.log(listsql);
		let JobList = function(){		
				connection.query({
					sql: listsql,
					timeout: 120000, // 120s
					values: dataVal
				}, function (error, results) {
					  if (error){
					  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});			  	 	
					  }else{
					  	 res.status(200).json({"success":1,"jobs":results});			 						  	 		
					  }		    
				});	
		};
		TokenCheck(token).then(function(tokenResult){
			return JobList();
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});			
})
app.post('/ListApplication', function (req, res) {	
		var token=req.headers.token;
		var employee_id=req.body.employee_id;// for all application this field should be 0	
		var employer_id=req.body.employer_id;// for all applicaqtion this field should be 0	
		var listsql=sqllib.SelectQueries.AllJobApplication;
		var dataVal=1;
		if(employee_id!=0){
			listsql=sqllib.SelectQueries.EmployeeJobApplication;
			dataVal=[employee_id];
		}
		else if(employer_id!=0){
			listsql=sqllib.SelectQueries.EmployerJobApplication;
			dataVal=[employer_id];
		}			
		let ApplicationListingFunction = function(){		
			connection.query({
				sql: listsql,
				timeout: 120000, // 120s
				values: dataVal
			}, function (error, results) {
				  if (error){
				  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});			  	 	
				  }else{
				  	 res.status(200).json({"success":1,"jobApplications":results});			 						  	 		
				  }		    
			});	
		};
		TokenCheck(token).then(function(tokenResult){
			return ApplicationListingFunction();
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});					
})
app.post('/ShortlistRejectApplicant', function (req, res) {	
		var token=req.headers.token;
		var employee_id=req.body.employee_id;// for all application this field should be 0	
		var job_id=req.body.job_id;// for all applicaqtion this field should be 0	
		var status=req.body.status;// 0 for pending, 1- shortlist, 2- reject
		let UpdateApplication = function(){		
			connection.query({
				sql: sqllib.UpdateQueries.UpdateApplicationStatus,
				timeout: 120000, // 120s
				values: [status,job_id,employee_id]
			}, function (error, results) {
				  if (error){
				  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});			  	 	
				  }else{
				  	 res.status(200).json({"success":1,"msg":"Updated successfully"});			 						  	 		
				  }		    
			});	
		};
		TokenCheck(token).then(function(tokenResult){
			return UpdateApplication();
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});					
})
/* employee API */
app.post('/GetActiveUpcomingJobs', function (req, res) {	
		var token=req.headers.token;
		var employee_id=req.body.employee_id;// for list of job for an employee 
		var currentdate = new Date(); 
		var datetime = currentdate.getFullYear() + "-" + (currentdate.getMonth()+1)  + "-" + currentdate.getDate() + "  "  + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
		var listsql=sqllib.SelectQueries.GetActiveUpcomingJobs;
		var dataVal=[datetime,datetime];
		if(employee_id!=0){
			listsql=sqllib.SelectQueries.JobsForEmployee;
			dataVal=[datetime,employee_id,datetime];
		}	
		//res.end(datetime);	
		let GetAUJobs = function(){		
			connection.query({
				sql: listsql,
				timeout: 120000, // 120s
				values: dataVal
			}, function (error, results) {
				  if (error){
				  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});			  	 	
				  }else{
				  	 res.status(200).json({"success":1,"jobs":results});			 						  	 		
				  }		    
			});	
		};
		TokenCheck(token).then(function(tokenResult){
			return GetAUJobs();
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});			
})
app.post('/ApplyJob', function (req, res) {	
		var token=req.headers.token;
		var job_id=req.body.job_id;// for all job this field should be 0	
		var employee_id=req.body.employee_id;// for all job this field should be 0	
		let UniqueJobApplication = function(){		
			return new Promise(function(resolve,reject){		
				connection.query({
					sql: sqllib.SelectQueries.UniqueApplication,
					timeout: 120000, // 120s
					values: [employee_id,job_id]
				}, function (error, results) {
					  if (error){
					  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});
					  	 resolve(false);			  	 	
					  }else{
					  	 if(results.length==0){
					  	 	resolve(true);
					  	 }				  	 	
					  	 else{
					  	 	resolve(false);	 	
					  	 }				  	 						  	 		
					  }		    
				});	
			});
		};	
		let JobApplication = function(){				
			connection.query({
				sql: sqllib.InsertQueries.SaveJobApplication,
				timeout: 120000, // 120s
				values: [job_id,employee_id]
			}, function (error, results) {
				  if (error){
				  	 res.status(501).json({"success":0,"msg":errObj.errorServerMsg});			  	 	
				  }else{
				  	 res.status(200).json({"success":1,"lastid":results.insertId});			 						  	 		
				  }		    
			});	
		};
		TokenCheck(token).then(function(tokenResult){
			return UniqueJobApplication();
		}).then(function(applicationResponse){
			if(applicationResponse)
				return JobApplication();
			else
				res.status(400).json({"success":0,"msg":"Already Applied"});					  	 		
		}).catch(function(catchmsg){
			res.status(500).json({"success":0,"msg":catchmsg});	
		});			
})
var employeeUpld = employeeupload.single('Photo');
app.post('/EmployeeSignup', employeeUpld, function (req, res, next) {
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
	var token=req.headers.token;
	let listingEmployeeFunction = function(){			
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
	};
	TokenCheck(token).then(function(tokenResult){
		return listingEmployeeFunction();
	}).catch(function(catchmsg){
		res.status(500).json({"success":0,"msg":catchmsg});	
	});
})
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})