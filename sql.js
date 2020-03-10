var InsertQueries={
	EmployeeSignup:"INSERT INTO `employee`(`Name`, `Email`, `Phone`, `AadharNum`, `Occupation`, `Photo`, `Location`, `Language`, `ReferralCode`, `AccNum`, `AccName`, `IFSC`, `BankName`, `PtmNum`, `TezNum`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
	EmployerSignup:"INSERT INTO `employer`(`Name`, `Role`, `Phone`, `AlernatePhone`, `OfficialMail`, `AadharNum`, `AadharAttachment`,`CompanyName`, `BusinessType`, `CompanyMail`, `City`, `Location`, `GSTIN`, `GstAttachment`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
	LoggedTable:"INSERT INTO `logged`(`user_id`, `type`, `token`) VALUES (?,?,?)"
};
var SelectQueries={
	AllEmployee:"select * from employee",
	EmployerSignIn:"SELECT `employer_id` as id, `Name`, `Role`, `Phone` FROM `employer` WHERE `Phone`= ?",
	EmployeeSignIn:"SELECT `employee_id` as id, `Name`, `Email`, `Phone` FROM `employee` WHERE `Phone`= ?",
	EmployerValidate:"SELECT `employer_id` as id FROM `employer` WHERE `City`=? and `Location`=? and `AadharNum`=?"
};

module.exports = { InsertQueries: InsertQueries,SelectQueries: SelectQueries };