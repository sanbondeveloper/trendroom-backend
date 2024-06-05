const express = require('express');
const { readInterests } = require('../controllers/user');
const { isLoggedIn } = require('../middlewares');

const router = express.Router();

router.get('/interests', readInterests);

module.exports = router;
