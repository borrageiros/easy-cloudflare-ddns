const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../../jwt-config');

console.log("🆗 /generate-api-token");

/**
 * @swagger
 * /api/generate-api-token:
 *   get:
 *     summary: Generate API token
 *     description: Generate a new API token.
 *     tags:
 *       - Auth
 *     security:
 *       - apiKeyAuth: []
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
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
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

router.get('/', (req, res) => {
  try {
    const token = jwt.sign({ type: "api-token" }, getJwtSecret());
    return res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error });
  } 
});

module.exports = router;