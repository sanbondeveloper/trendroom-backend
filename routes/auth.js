const express = require('express');

const {
  join,
  login,
  logout,
  kakaoLogin,
  naverLogin,
  checkReferralCode,
} = require('../controllers/auth');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

router.get('/logout', isLoggedIn, logout);

router.post('/kakao', kakaoLogin);

router.post('/naver', naverLogin);

router.get('/referrer/:code', checkReferralCode);

module.exports = router;
