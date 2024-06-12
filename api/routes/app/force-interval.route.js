const express = require('express');
const router = express.Router();
const { executeUpdater } = require('../../check-interval');

console.log("🆗 /force-interval POST");

router.post('/', async (req, res) => {
  try {
    executeUpdater();
    res.status(200).json({ message: "Forced successfully" });
  } catch (error) {
    res.status(500).json({ error: error });
  }  
});

module.exports = router;