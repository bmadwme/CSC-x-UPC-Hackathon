const express = require('express');
const router = express.Router();

const {
    databaseHealthCheck
} = require('../controllers/databaseController');


router.get('/health-check',databaseHealthCheck);
module.exports = router;