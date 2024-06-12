const express = require('express');
const router = express.Router();
const { insertDocument, findDocuments } = require('../../../database/db');
const { getRecordId } = require('../../cloudflare-api');

console.log("🆗 /record POST");

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