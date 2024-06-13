const express = require('express');
const router = express.Router();
const { findDocuments } = require('../../../database/db');

console.log("🆗 /config GET");

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Retrieve configuration
 *     description: Fetch the configuration document from the database.
 *     tags:
 *       - Config
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
 *                     _id:
 *                       type: string
 *                       example: IdkIAFkbadsoIDSF
 *                     email:
 *                       type: string
 *                       example: email@email.com 
 *                     token:
 *                       type: string
 *                       example: LOKADFBIAlASJLDAS
 *                     checkInterval:
 *                       type: integer
 *                       example: 1440
 *                     lastIp:
 *                       type: string
 *                       example: X.X.X.X
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
 *       404:
 *         description: Config not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Config not found
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
    findDocuments({ type: "config" }, (err, config) => {
        if (!err) {
            if (config[0]) {
                res.status(200).json({ data: config[0] });
            } else {
                res.status(404).json({ error: "Config not found" });
            }
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;