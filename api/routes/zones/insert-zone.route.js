const express = require('express');
const router = express.Router();
const { insertDocument, findDocuments } = require('../../../database/db');
const { getZoneInfo } = require('../../cloudflare-api');

console.log("🆗 /zone POST");

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