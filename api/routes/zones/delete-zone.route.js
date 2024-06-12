const express = require('express');
const router = express.Router();
const { removeDocument, findDocuments } = require('../../../database/db');

console.log("🆗 /zone DELETE");

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