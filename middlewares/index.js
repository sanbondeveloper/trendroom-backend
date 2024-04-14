const jwt = require('jsonwebtoken');

const User = require('../schemas/user');

exports.getUser = async (req, res, next) => {
  console.log('cookies', req.cookies);
  console.log('signedCookies', req.signedCookies);
  console.log('session', req.session.auth);
  console.log('sessionID', req.sessionID);
  console.log('-------------------------------------------------------');

  if (!req.session.userId) return next();

  const exUser = await User.findById(req.session.userId);

  req.user = exUser;
  next();
};

exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(403).send('로그인이 필요합니다.');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    res.status(403).send('로그인한 상태입니다.');
  }
};

exports.verifyToken = (req, res, next) => {
  try {
    res.locals.decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res
        .status(419)
        .json({ code: 419, message: '토큰이 만료되었습니다.' });
    }

    return res
      .status(401)
      .json({ code: 401, message: '유효하지 않은 토큰입니다.' });
  }
};
