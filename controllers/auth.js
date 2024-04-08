const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../schemas/user');

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;

  try {
    const exUser = await User.findOne({ email: email });

    if (exUser) {
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });

    res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const exUser = await User.findOne({ email: email });

    if (exUser) {
      const result = await bcrypt.compare(password, exUser.password);

      if (result) {
        const token = jwt.sign(
          {
            _id: exUser._id,
            email: exUser.email,
            nick: exUser.nicl,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '35d',
          }
        );

        return res.json({
          code: 200,
          message: '토큰이 발급되었습니다.',
          token,
        });
      } else {
        return res
          .status(401)
          .json({ code: 401, message: '회원정보가 일치하지 않습니다.' });
      }
    } else {
      return res
        .status(401)
        .json({ code: 401, message: '회원정보가 존재하지 않습니다.' });
    }
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

exports.test = (req, res) => {
  res.json(res.locals.decoded);
};
