const express = require('express');
const getExternalIP = require('../../get-external-ip');
const { getIsPaused, pauseInterval, resumeInterval } = require('../../check-interval');
const router = express.Router();

console.log("🆗 /toggle-pause-interval GET");

/**
 * @swagger
 * /api/toggle-pause-interval:
 *   get:
 *     summary: Toggle pause interval
 *     description: Toggle the pause state of the interval. If the interval is paused, it will be resumed. If it is running, it will be paused.
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
 *                   example: Interval resumed!
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

router.get('/', async (req, res) => {
    try {
        const isPaused = await getIsPaused();
        if ( isPaused ) {
            await resumeInterval();
            res.status(200).json({ message: "Interval resumed!" });
        } else {
            await pauseInterval();
            res.status(200).json({ message: "Interval paused!" });
        }
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

module.exports = router;