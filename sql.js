var InsertQueries={
	EmployeeSignup:"INSERT INTO `employee`(`Name`, `Email`, `Phone`, `AadharNum`, `Occupation`, `Photo`, `Location`, `Language`, `ReferralCode`, `AccNum`, `AccName`, `IFSC`, `BankName`, `PtmNum`, `TezNum`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
	EmployerSignup:"INSERT INTO `employer`(`Name`, `Role`, `Phone`, `AlernatePhone`, `OfficialMail`, `Password`,`AadharNum`, `AadharAttachment`,`CompanyName`, `BusinessType`, `CompanyMail`, `City`, `Location`, `GSTIN`, `GstAttachment`,`Verified`,`Minimum_amt`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
	LoggedTable:"INSERT INTO `logged`(`user_id`, `type`, `token`) VALUES (?,?,?)",
	CreateJob:"INSERT INTO `job`(`job_title`, `job_description`, `spcl_instruction`, `job_amt`,`num_of_employee`, `start_time`, `end_time`, `booking_radius`,`reporting_time`, `reporting_location`, `pickup_provided`, `quota_cancel`,`createdBy`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
	SaveJobPickup:"INSERT INTO `job_pickup_details`(`job_id`, `contact_person`, `pickup_location`, `driver_name`, `driver_phone`) VALUES (?,?,?,?,?)",
	SaveJobApplication:"INSERT INTO `job_application`(`job_id`, `employee_id`) VALUES (?,?)"
};
var SelectQueries={
	ValidateToken:"select user_id from logged where token=?",
	AllEmployee:"select * from employee where 1",
	AllJobs:"select job.*,jpd.pickup_id,jpd.contact_person,jpd.pickup_location,jpd.driver_name,jpd.driver_phone,employer.name as employerName,employer.CompanyName from job left join job_pickup_details jpd on jpd.job_id=job.job_id left join employer on employer.employer_id=job.createdBy where ?",
	JobsByStatus:"select job.*,jpd.pickup_id,jpd.contact_person,jpd.pickup_location,jpd.driver_name,jpd.driver_phone,employer.name as employerName,employer.CompanyName from job left join job_pickup_details jpd on jpd.job_id=job.job_id left join employer on employer.employer_id=job.createdBy where job_status=?",
	JobsByEmployer:"select job.*,jpd.pickup_id,jpd.contact_person,jpd.pickup_location,jpd.driver_name,jpd.driver_phone,employer.name as employerName,employer.CompanyName,(select count(ja.job_id) from job_application ja where ja.job_id=job.job_id) as num_applicant,(select count(ja2.job_id) from job_application ja2 where ja2.job_id=job.job_id and ja2.application_status=1) as shortlisted_applicant,(select count(ja3.job_id) from job_application ja3 where ja3.job_id=job.job_id and ja3.application_status=2) as rejected_applicant from job left join job_pickup_details jpd on jpd.job_id=job.job_id left join employer on employer.employer_id=job.createdBy where createdBy=?",
	JobsForEmployee:"select job.*,DATEDIFF(job.start_time,?) as jobtimediff,jpd.pickup_id,jpd.contact_person,jpd.pickup_location,jpd.driver_name,jpd.driver_phone,job_application.application_status from job left join job_pickup_details jpd on jpd.job_id=job.job_id left join job_application on job_application.job_id=job.job_id and job_application.employee_id=? where DATEDIFF(job.start_time,?)>=0",
	UniqueApplication:"SELECT * FROM `job_application` WHERE `employee_id`= ? and `job_id`=?",
	GetActiveUpcomingJobs:"select job.*,DATEDIFF(job.start_time,?) as jobtimediff,jpd.pickup_id,jpd.contact_person,jpd.pickup_location,jpd.driver_name,jpd.driver_phone from job left join job_pickup_details jpd on jpd.job_id=job.job_id where DATEDIFF(job.start_time,?)>=0",
	EmployerSignIn:"SELECT `employer_id` as id, `Name`, `Role`, `Phone` FROM `employer` WHERE `OfficialMail`= ? and `Password`= ?",
	EmployeeSignIn:"SELECT `employee_id` as id, `Name`, `Email`, `Phone` FROM `employee` WHERE `Phone`= ?",
	EmployerValidate:"SELECT `employer_id` as id FROM `employer` WHERE `City`=? and `Location`=? and `AadharNum`=?",
	AllJobApplication:"select job_application.application_id,job_application.employee_id,job_application.applied_on,job.*,job_pickup_details.pickup_id,job_pickup_details.contact_person,job_pickup_details.pickup_location,job_pickup_details.driver_name,job_pickup_details.driver_phone from job_application left join job on job.job_id=job_application.job_id left join job_pickup_details on job_pickup_details.job_id=job.job_id where ?",
	EmployeeJobApplication:"select job_application.application_id,job_application.employee_id,job_application.applied_on,job.*,job_pickup_details.pickup_id,job_pickup_details.contact_person,job_pickup_details.pickup_location,job_pickup_details.driver_name,job_pickup_details.driver_phone from job_application left join job on job.job_id=job_application.job_id left join job_pickup_details on job_pickup_details.job_id=job.job_id where job_application.employee_id=?",
	EmployerJobApplication:"select job_application.application_id,job_application.employee_id,job_application.applied_on,job.*,job_pickup_details.pickup_id,job_pickup_details.contact_person,job_pickup_details.pickup_location,job_pickup_details.driver_name,job_pickup_details.driver_phone from job_application left join job on job.job_id=job_application.job_id left join job_pickup_details on job_pickup_details.job_id=job.job_id left join employer on employer.employer_id=job.createdBy where employer.employer_id=?"
};
var DeleteQueries={
	DeleteLogged:"DELETE FROM `logged` WHERE token=?"
};
var UpdateQueries={
	UpdateApplicationStatus:"UPDATE `job_application` SET `application_status`=? WHERE `job_id`=? and `employee_id`=?"
}

module.exports = { InsertQueries: InsertQueries,SelectQueries: SelectQueries, DeleteQueries:DeleteQueries, UpdateQueries:UpdateQueries };