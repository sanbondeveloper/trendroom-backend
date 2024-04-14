const express = require('express');
const passport = require('passport');

const {
  join,
  login,
  logout,
  kakaoLogin,
  naverLogin,
} = require('../controllers/auth');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');

const router = express.Router();

router.post('/join', isNotLoggedIn, join);

router.post('/login', isNotLoggedIn, login);

router.get('/logout', isLoggedIn, logout);

router.post('/kakao', kakaoLogin);

router.post('/naver', naverLogin);

// router.get('/kakao', passport.authenticate('kakao'));

// router.get('/callback/kakao', passport.authenticate('kakao'), (req, res) => {
//   res.status(200).end();
// });

module.exports = router;
