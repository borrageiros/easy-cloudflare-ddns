const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../jwt-config');

console.log("🆗 /login");


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login
 *     description: Authenticate and generate a JWT token if the password is correct (password is setted in environment variables).
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: your_password
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized - incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Incorrect password
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

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