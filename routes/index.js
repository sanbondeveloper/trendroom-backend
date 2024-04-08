const express = require('express');
const cors = require('cors');

const authRouter = require('./auth');

const router = express.Router();

router.use(
  cors({
    credentials: true,
  })
);
router.use('/auth', authRouter);

module.exports = router;
