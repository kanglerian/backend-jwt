const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models')

router.get('/', async (req, res) => {
  return res.send('Authentication System.');
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email
    }
  });
  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(400).json({ message: 'Password anda salah.' });
  const userId = user.id;
  const userIdentity = user.identity;
  const userName = user.name;
  const userPhone = user.phone;
  const userEmail = user.email;
  const userStatus = user.status;
  const accessToken = jwt.sign({ userId, userIdentity, userName, userPhone, userEmail, userStatus }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
  const refreshToken = jwt.sign({ userId, userIdentity, userName, userPhone, userEmail, userStatus }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

  await User.update({ refresh_token: refreshToken }, {
    where: {
      id: userId,
    }
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
  })

  return res.status(200).json({ token: accessToken });
})

router.get('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) return res.sendStatus(401);
  const user = await User.findOne({
    where: {
      refresh_token: refreshToken
    }
  });
  if (!user) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
    if (error) return res.sendStatus(403);
    const userId = user.id;
    const userIdentity = user.identity;
    const userName = user.name;
    const userPhone = user.phone;
    const userEmail = user.email;
    const userStatus = user.status;
    const accessToken = jwt.sign({ userId, userIdentity, userName, userPhone, userEmail, userStatus }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    return res.status(200).json({ token: accessToken });
  });
});

router.delete('/logout', async(req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if(!refreshToken) return res.sendStatus(204);
  const user = await User.findOne({
    where: {
      refresh_token: refreshToken
    }
  });
  if(!user) return res.sendStatus(204);
  const userId = user.id;
  await User.update({ refresh_token: null },{
    where: {
      id: userId
    }
  });
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
});

module.exports = router;
