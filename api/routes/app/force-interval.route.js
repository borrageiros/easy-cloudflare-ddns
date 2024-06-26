const express = require('express');
const router = express.Router();
const { executeUpdater } = require('../../check-interval');

console.log("🆗 /force-interval POST");

/**
 * @swagger
 * /api/force-interval:
 *   post:
 *     summary: Force interval update
 *     description: Endpoint to force the update of the interval.
 *     tags:
 *       - App
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
 *                 message:
 *                   type: string
 *                   example: Forced successfully
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

router.post('/', async (req, res) => {
  try {
    executeUpdater();
    res.status(200).json({ message: "Forced successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }  
});

module.exports = router;