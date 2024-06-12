const express = require('express');
const getExternalIP = require('../../get-external-ip');
const { getRemainingTime } = require('../../check-interval');
const router = express.Router();

console.log("🆗 /app GET");

router.get('/', async (req, res) => {
    const externalIp = await getExternalIP();
    const remainingTime = getRemainingTime();
    if ( externalIp && remainingTime ) {
        res.status(200).json({ data: { externalIp, remainingTime } });
    } else {
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;