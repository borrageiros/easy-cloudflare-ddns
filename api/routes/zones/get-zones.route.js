const express = require('express');
const router = express.Router();
const { findDocuments } = require('../../../database/db');

console.log("🆗 /zone GET");

/**
 * @swagger
 * /api/zone:
 *   get:
 *     summary: Get all zones
 *     description: Retrieve all DNS zones.
 *     tags:
 *       - Zone
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: zone
 *                       name:
 *                         type: string
 *                         example: borrageiros.com
 *                       zoneId:
 *                         type: string
 *                         example: asdibLSLJihbJKCVkuiflikjb
 *                       _id:
 *                         type: string
 *                         example: 60c5f16f45a3a448e0c99e18
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
    findDocuments({ type: "zone" }, (err, zones) => {
        if (!err) {
            res.status(200).json({ data: zones.reverse() });
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;