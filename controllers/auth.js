const bcrypt = require('bcrypt');
const axios = require('axios');
const User = require('../schemas/user');

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URL = 'http://localhost:3000/api/auth/callback/kakao';

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const NAVER_REDIRECT_URL = 'http://localhost:3000/api/auth/callback/naver';

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
    console.error(error);
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const exUser = await User.findOne({ email });

    console.log(password, exUser.password);

    if (exUser) {
      const result = await bcrypt.compare(password, exUser.password);

      if (result) {
        req.session.userId = exUser._id;

        return res.status(200).json({ message: '로그인 성공' });
      } else {
        return res
          .status(401)
          .json({ message: '회원 정보가 일치하지 않습니다.' });
      }
    } else {
      return res.status(401).json({ message: '가입 되지 않은 회원입니다.' });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: '세션 삭제 에러' });
    } else {
      res.status(204).end();
    }
  });
};

exports.kakaoLogin = async (req, res, next) => {
  const { code } = req.body;

  try {
    const {
      data: {
        access_token,
        expires_in,
        refresh_token,
        refresh_token_expires_in,
      },
    } = await axios.post(
      `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URL}&code=${code}`,

      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const { data } = await axios.post(
      'https://kapi.kakao.com/v2/user/me',
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const exUser = await User.findOne({
      snsId: data.id,
      provider: 'kakao',
    });

    if (exUser) {
      req.session.userId = exUser._id;
    } else {
      const newUser = await User.create({
        email: data?.properties?.email,
        nick: data?.properties?.nickname,
        snsId: data.id,
        provider: 'kakao',
      });

      req.session.userId = newUser._id;
    }

    req.session.auth = {
      access_token,
      expires_in,
      refresh_token,
      refresh_token_expires_in,
    };

    res.status(200).json({ message: '카카오 로그인 성공' });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.naverLogin = async (req, res, next) => {
  const { code, state } = req.body;

  try {
    const {
      data: { access_token, expires_in, refresh_token },
    } = await axios.post(
      `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${NAVER_CLIENT_ID}&client_secret=${NAVER_CLIENT_SECRET}&redirect_uri=${NAVER_REDIRECT_URL}&code=${code}&state=${state}`,

      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const {
      data: { response },
    } = await axios.post(
      'https://openapi.naver.com/v1/nid/me',
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      }
    );

    const exUser = await User.findOne({
      snsId: response.id,
      provider: 'naver',
    });

    if (exUser) {
      req.session.userId = exUser._id;
    } else {
      const newUser = await User.create({
        email: response?.email,
        nick: response.name,
        snsId: response.id,
        provider: 'naver',
      });

      req.session.userId = newUser._id;
    }

    req.session.auth = {
      access_token,
      expires_in,
      refresh_token,
    };

    res.status(200).json({ message: '네이버 로그인 성공' });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
