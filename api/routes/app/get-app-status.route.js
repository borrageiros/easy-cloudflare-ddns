const express = require('express');
const getExternalIP = require('../../get-external-ip');
const { getRemainingTime, getIsPaused } = require('../../check-interval');
const { findDocuments } = require('../../../database/db');
const router = express.Router();

console.log("🆗 /app GET");

/**
 * @swagger
 * /api/app:
 *   get:
 *     summary: Retrieve application status
 *     description: Get the general App status.
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     externalIp:
 *                       type: string
 *                       example: X.X.X.X 
 *                     remainingTime:
 *                       type: integer
 *                       example: 5845267
 *                     isPaused:
 *                       type: boolean
 *                       example: false
 *                     totalZones:
 *                       type: integer
 *                       example: 5
 *                     totalRecords:
 *                       type: integer
 *                       example: 23
 *                     formatedRemainingTime:
 *                       type: string
 *                       example: 01:37:25
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
  const externalIp = await getExternalIP();
  const remainingTime = await getRemainingTime();
  const isPaused = await getIsPaused();
  let totalZones = 0;
  let totalRecords = 0;

  function msToTime(s) {
    function pad(n, z) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
  }

  try {
    findDocuments({ type: "zone" }, (err, docs) => {
      if (!err) {
        totalZones = docs.length;
        findDocuments({ type: "record" }, (err, docs) => {
          if (!err) {
            totalRecords = docs.length;
            res.status(200).json({ data: { externalIp, remainingTime, isPaused, totalZones, totalRecords, formatedRemainingTime: msToTime(remainingTime) } });
          } else {
            res.status(500).json({ error: err });
          }
        });
      } else {
        res.status(500).json({ error: err });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;