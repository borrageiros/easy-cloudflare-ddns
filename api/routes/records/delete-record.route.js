const express = require('express');
const router = express.Router();
const { removeDocument } = require('../../../database/db');

console.log("🆗 /record DELETE");

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