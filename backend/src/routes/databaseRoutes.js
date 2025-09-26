const express = require('express');
const router = express.Router();

const {
    databaseHealthCheck,
    createUser

    
} = require('../controllers/databaseController');


router.get('/health-check',databaseHealthCheck);
router.post('/create-user',createUser);
module.exports = router;