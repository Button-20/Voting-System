const express = require('express');
const router = express.Router();

const ctrlContestant = require('../controllers/contestant.controller');
const ctrlMember = require('../controllers/member.controller');
const ctrlDues = require('../controllers/dues.controller');
const ctrlAttendance = require('../controllers/attendance.controller');



// User
router.get('/user/memberscount/:classname', ctrlMember.getCount);
router.get('/user/malemembers/:classname', ctrlMember.getMale);
router.get('/user/femalemembers/:classname', ctrlMember.getFemale);
router.get('/user/members/:id', ctrlMember.getID);
router.get('/user/members/classname/:classname', ctrlMember.getClassname);
router.put('/user/members/:id', ctrlMember.put);
router.delete('/user/members/:id', ctrlMember.delete);

/////////////////////////////////////////////////////////////////

// Contestant => localhost:3000/api/.......
router.post('/contestant/register', ctrlContestant.register);
router.get('/contestants', ctrlContestant.get);
router.get('/allcontestantscount', ctrlContestant.getAllCount);
router.get('/contestant/:id', ctrlContestant.getID);
router.put('/contestant/:id', ctrlContestant.put);
router.delete('/contestant/:id', ctrlContestant.delete);


module.exports = router;