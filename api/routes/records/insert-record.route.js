const express = require('express');
const router = express.Router();
const { insertDocument, findDocuments } = require('../../../database/db');
const { getRecordId } = require('../../cloudflare-api');

console.log("🆗 /record POST");

/**
 * @swagger
 * /api/record:
 *   post:
 *     summary: Create a new record
 *     description: Create a new DNS record.
 *     tags:
 *       - Record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: ddns.borrageiros.com
 *               zoneId:
 *                 type: string
 *                 example: asdibLSLJihbJKCVkuiflikjb
 *               proxy:
 *                 type: boolean
 *                 example: true
 *               ttl:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: { type: "record", name: "ddns.borrageiros.com", zoneId: "asdibLSLJihbJKCVkuiflikjb", proxy: true, ttl: 0, recordId: "akIKGvuhKJHGkjvJlkGHKjgLK", "_id": "60c5f16f45a3a448e0c99e18" }
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
 *         description: Record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 error:
 *                   type: string
 *                   example: Record not found in your CloudFlare account
 *       409:
 *         description: Conflict - record with the provided name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 409
 *                 error:
 *                   type: string
 *                   example: The record with the provided name already exists
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
    const { name, zoneId, proxy, ttl } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Missing or invalid "name" field in request body. Please provide a valid "name"' });
    }
    if (!zoneId) {
        return res.status(400).json({ error: 'Missing or invalid "zoneId" field in request body. Please provide a valid "zoneId"' });
    }
    if (proxy === undefined) {
        return res.status(400).json({ error: 'Missing or invalid "proxy" field in request body. Please provide a valid "proxy"' });
    }
    if (isNaN(ttl)) {
        return res.status(400).json({ error: 'Missing or invalid "ttl" field in request body. Please provide a valid "ttl"' });
    }

    findDocuments({ type: "record" }, async (err, docs) => {
        if (!err) {
            const recordExists = docs.some(doc => doc.name === name);
            if ( recordExists ) {
                return res.status(409).json({ status: 409, error: 'The record with the provided name already exists' });
            }
            const recordId = await getRecordId(zoneId, name);
            if ( !recordId ) {
                return res.status(404).json({ status: 404, error: 'Record not found in your CloudFlare account' });
            } else {
                insertDocument({ type: "record", name, zoneId, proxy, ttl, recordId }, (err, newDoc) => {
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