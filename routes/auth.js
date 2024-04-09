const express = require('express');

const { join, login, kakaoLogin, test } = require('../controllers/auth');
const { verifyToken } = require('../middlewares');

const router = express.Router();

router.post('/login', login);

router.post('/login/kakao', kakaoLogin);

router.post('/join', join);

router.get('/test', verifyToken, test);

module.exports = router;
