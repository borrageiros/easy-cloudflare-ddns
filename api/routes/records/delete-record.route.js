const express = require('express');
const router = express.Router();
const { removeDocument } = require('../../../database/db');

console.log("🆗 /record DELETE");

/**
 * @swagger
 * /api/record/{id}:
 *   delete:
 *     summary: Delete a record
 *     description: Delete a specific record by ID.
 *     tags:
 *       - Record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the record to delete.
 *     responses:
 *       200:
 *         description: Document removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document removed successfully
 *       400:
 *         description: Bad request - missing or invalid ID
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
 *         description: Document not found
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
    const query = {type: "record", _id: id };

    removeDocument(query, {}, (err, numRemoved) => {
        if (!err) {
            if (numRemoved === 0) {
                return res.status(404).json({ error: 'Document not found for the provided ID' });
            }
            res.status(200).json({ message: 'Document removed successfully' });
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;