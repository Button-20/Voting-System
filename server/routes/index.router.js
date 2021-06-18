const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');
const ctrlMember = require('../controllers/member.controller');
const ctrlDues = require('../controllers/dues.controller');
const ctrlAttendance = require('../controllers/attendance.controller');

const jwtHelper = require('../config/jwtHelper');

// Users
router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/users', jwtHelper.verifyJwtToken, ctrlUser.get);
router.get('/users/:id',jwtHelper.verifyJwtToken, ctrlUser.getID);
router.put('/users/:id', jwtHelper.verifyJwtToken, ctrlUser.put);
// router.put('/userspermission/:id', ctrlUser.putLoginPermission);
router.delete('/users/:id', jwtHelper.verifyJwtToken, ctrlUser.delete);

// Member => localhost:3000/api/.......
router.post('/user/members/register', jwtHelper.verifyJwtToken, ctrlMember.register);
router.post('/user/uploadExcel/:type', jwtHelper.verifyJwtToken, ctrlMember.create);
// router.post('/user/members/insertExcel/:type', ctrlMember.uploadExcel);
router.get('/user/members', jwtHelper.verifyJwtToken, ctrlMember.get);


// Admin
router.get('/user/memberscountall', jwtHelper.verifyJwtToken, ctrlMember.getAllCount);
router.get('/user/malememberscountall', jwtHelper.verifyJwtToken, ctrlMember.getAllMaleCount);
router.get('/user/femalememberscountall', jwtHelper.verifyJwtToken, ctrlMember.getAllFemaleCount);


// User
router.get('/user/memberscount/:classname', ctrlMember.getCount);
router.get('/user/malemembers/:classname', ctrlMember.getMale);
router.get('/user/femalemembers/:classname', ctrlMember.getFemale);
router.get('/user/members/:id', ctrlMember.getID);
router.get('/user/members/classname/:classname', ctrlMember.getClassname);
router.put('/user/members/:id', ctrlMember.put);
router.delete('/user/members/:id', ctrlMember.delete);

/////////////////////////////////////////////////////////////////

// Dues => localhost:3000/api/.......
router.post('/user/dues/register', ctrlDues.register);
router.get('/user/dues', ctrlDues.get);
router.get('/user/dues/:id', ctrlDues.getID);
router.get('/user/duescount', ctrlDues.getCount);
router.get('/user/dues/classname/:classname', ctrlDues.getClassname);
router.get('/user/dues/total/:classname', ctrlDues.getSum);
router.get('/user/duesalltotal', ctrlDues.getAllSum);
router.get('/user/alldatafilter/:startdate/:enddate', ctrlDues.getAllDateFilter);
router.put('/user/dues/:id', ctrlDues.put);
router.delete('/user/dues/:id', ctrlDues.delete);

// Attendance => localhost:3000/api/.......
router.post('/user/attendance/register', ctrlAttendance.register);
router.get('/user/attendance', ctrlAttendance.get);
router.get('/user/attendance/:id', ctrlAttendance.getID);
router.get('/user/attendancecount/:classname', ctrlAttendance.getCount);
router.get('/user/allattendancecount', ctrlAttendance.getAllCount);
router.get('/user/allattendancedatefilter/:startdate/:enddate', ctrlAttendance.getAllAttendanceDateFilter);
router.get('/user/attendance/classname/:classname', ctrlAttendance.getClassname);
router.put('/user/attendance/:id', ctrlAttendance.put);
router.delete('/user/attendance/:id', ctrlAttendance.delete);


module.exports = router;