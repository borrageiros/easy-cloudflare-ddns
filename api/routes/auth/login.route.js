const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../jwt-config');

console.log("🆗 /login");

router.post('/', (req, res) => {
    const { password } = req.body;
    const realPassword = process.env.PASSWORD;

    if ( password === realPassword ) {
      const token = jwt.sign({ type: "user" }, getJwtSecret(), { expiresIn: '24h' });
      return res.json({ token });

    }
  
    res.status(401).json({ error: 'Incorrect password' });
  });

module.exports = router;