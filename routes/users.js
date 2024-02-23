const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const verifyToken = require('../middlewares/verifyToken');
const { User } = require('../models');

router.get('/', verifyToken, async (req, res) => {
  const users = await User.findAll();
  return res.status(200).json(users);
});

router.post('/', async(req, res) => {
  const { identity, name, phone, email, password, confPassword } = req.body;
  if(password !== confPassword) return res.status(400).json({ message: 'Password tidak sama.' });
  const checkEmail = await User.findOne({
    where: {
      email: email,
    }
  });
  if(checkEmail){
    return res.status(400).json({ message: 'Email sudah ada yang menggunakan' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    identity: identity,
    name: name,
    phone: phone,
    email: email,
    password: hashedPassword
  });
  return res.status(200).json({
    message: 'Registrasi berhasil!'
  })
});

module.exports = router;
