const express = require('express');
const router = express.Router();
const { updateDocument, findDocuments } = require('../../../database/db');

console.log("🆗 /record PUT");

/**
 * @swagger
 * /api/record/{id}:
 *   put:
 *     summary: Update a record
 *     description: Update a specific DNS record by its ID.
 *     tags:
 *       - Record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record to update
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
 *         description: Record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document updated successfully
 *                 affectedDocuments:
 *                   type: number
 *                   example: 1
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
 *                   example: Missing field to update in request body. Please provide a valid "name", "zoneId", "proxy" or "ttl"
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
 *                 error:
 *                   type: string
 *                   example: Document not found for the provided ID
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

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, zoneId, proxy, ttl } = req.body;
    
    if (!name && isNaN(zoneId) && proxy === undefined && isNaN(ttl)) {
        return res.status(400).json({ error: 'Missing field to update in request body. Please provide a valid "name", "zoneId", "proxy" or "ttl"' });
    }

    const query = { _id: id };

    const update = {};
    if (name) update.name = name;
    if (!isNaN(zoneId)) update.zoneId = zoneId;
    if (proxy !== undefined) update.proxy = proxy;
    if (!isNaN(ttl)) update.ttl = ttl;

    const options = { multi: false };

    updateDocument(query, { $set: update }, options, (err, numAffected, affectedDocuments, upsert) => {
        if (!err) {
            if (numAffected === 0) {
                return res.status(404).json({ error: 'Document not found for the provided ID' });
            }
            findDocuments({ _id: id }, (err, newDoc) => {
                if (!err) {
                    res.status(200).json({ message: 'Document updated successfully', affectedDocuments, data: newDoc });
                } else {
                    res.status(500).json({ error: err });
                }
            });
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;