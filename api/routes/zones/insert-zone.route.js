const express = require('express');
const router = express.Router();
const { insertDocument, findDocuments } = require('../../../database/db');
const { getZoneInfo } = require('../../cloudflare-api');

console.log("🆗 /zone POST");

/**
 * @swagger
 * /api/zone:
 *   post:
 *     summary: Create a new zone
 *     description: Create a new DNS zone.
 *     tags:
 *       - Zone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: borrageiros.com
 *               zoneId:
 *                 type: string
 *                 example: asdibLSLJihbJKCVkuiflikjb
 *     responses:
 *       200:
 *         description: Zone created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: zone
 *                     name:
 *                       type: string
 *                       example: example.com
 *                     zoneId:
 *                       type: string
 *                       example: asdibLSLJihbJKCVkuiflikjb
 *                     _id:
 *                       type: string
 *                       example: 60c5f16f45a3a448e0c99e18
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing or invalid "name" field in request body. Please provide a valid "name"
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
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Zone not found in your CloudFlare account
 *       409:
 *         description: Conflict
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The zone with the provided "name" or "id" already exists
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
    const { name, zoneId } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Missing or invalid "name" field in request body. Please provide a valid "name"' });
    }
    if (!zoneId) {
        return res.status(400).json({ error: 'Missing or invalid "zoneId" field in request body. Please provide a valid "zoneId"' });
    }

    findDocuments({ type: "zone" }, async (err, docs) => {
        if (!err) {
            const zoneExists = docs.some(doc => doc.name === name);
            const zoneIdExists = docs.some(doc => doc.zoneId === zoneId);
            if ( zoneExists || zoneIdExists ) {
                return res.status(409).json({ status: 409, error: 'The zone with the provided "name" or "id" already exists' });
            }
            const zoneInfo = await getZoneInfo( zoneId );
            if ( !zoneInfo ) {
                return res.status(404).json({ status: 404, error: 'Zone not found in your CloudFlare account' });
            } else {
                insertDocument({ type: "zone", name, zoneId }, (err, newDoc) => {
                    if (!err) {
                        res.status(200).json({ data: newDoc });
                    } else {
                        res.status(500).json({ error: err });
                    }
                });
            }
        } else {
            return res.status(500).json({ error: err });
        }
    });
});

module.exports = router;