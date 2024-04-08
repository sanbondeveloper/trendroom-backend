const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');

const indexRouter = require('./routes');
const connect = require('./schemas');

dotenv.config();
const app = express();
app.set('port', process.env.PORT || 3001);
// 몽고디비 연결
connect();

// 개발 환경 - dev, 배포 환경 - combined
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}
// 정적 파일 제공, public/images/image.png -> 서버주소/images/image.png
app.use('/', express.static(path.join(__dirname, 'public')));
// req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// req.cookies, 쿠키는 클라이언트에서 위조하기 쉬우므로 비밀 키를 통해 만들어낸 서명을 쿠키 값에 붙임, req.signedCookies
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false, // 배포시 true
  },
  name: 'server-session',
};
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));

app.use('/api', indexRouter);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중!');
});
