const express = require('express');
const router = express.Router();
const { findDocuments } = require('../../../database/db');

console.log("🆗 /zone GET");

router.get('/', (req, res) => {
    findDocuments({ type: "zone" }, (err, zones) => {
        if (!err) {
            res.status(200).json({ data: zones.reverse() });
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;