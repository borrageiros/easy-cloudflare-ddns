const express = require('express');
const router = express.Router();
const { findDocuments } = require('../../../database/db');

console.log("🆗 /config GET");

router.get('/', (req, res) => {
    findDocuments({ type: "config" }, (err, config) => {
        if (!err) {
            if (config[0]) {
                res.status(200).json({ data: config[0] });
            } else {
                res.status(404).json({ error: "Config not found" });
            }
        } else {
            res.status(500).json({ error: err });
        }
    });
});

module.exports = router;