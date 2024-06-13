const express = require('express');
const router = express.Router();
const { removeDocument, findDocuments } = require('../../../database/db');

console.log("🆗 /zone DELETE");

/**
 * @swagger
 * /api/zone/{id}:
 *   delete:
 *     summary: Remove a zone and its associated records
 *     description: Remove a specific DNS zone and all associated records by its ID.
 *     tags:
 *       - Zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the zone to remove
 *     responses:
 *       200:
 *         description: Zone and associated records removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document removed successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing or invalid "id" field in request body. Please provide a valid "id"
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
 *         description: Zone not found
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

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Missing or invalid "id" field in request body. Please provide a valid "id"' });
    }
    const query = { type: "zone", zoneId: id };

    removeDocument(query, {}, (err, numRemoved) => {
        if (!err) {
            if (numRemoved === 0) {
                return res.status(404).json({ error: 'Document not found for the provided ID' });
            }
            findDocuments({ zoneId: id }, (err, docs) => {
                if (!err && docs.length > 0) {
                    docs.forEach((element) => {
                        removeDocument({ zoneId: element.zoneId}, {}, (err, numRemoved) => {});
                    });
                }
            });            
            res.status(200).json({ message: 'Document removed successfully' });
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;