const express = require('express');
const router = express.Router();
const { updateDocument, findDocuments } = require('../../../database/db');

console.log("🆗 /record PUT");

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