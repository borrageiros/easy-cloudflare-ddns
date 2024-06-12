const express = require('express');
const router = express.Router();
const { findDocuments } = require('../../../database/db');

console.log("🆗 /record GET");

router.get('/', (req, res) => {
    findDocuments({ type: "record" }, (err, docs) => {
        if (!err) {
            res.status(200).json({ data: docs.reverse() });
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;