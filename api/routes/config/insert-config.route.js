const express = require('express');
const router = express.Router();
const { insertDocument, findDocuments } = require('../../../database/db');
const { updateInterval } = require('../../check-interval');
const getExternalIP = require('../../get-external-ip');
const { checkAuth } = require('../../cloudflare-api');

console.log("🆗 /config POST");

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Create configuration
 *     description: Create a new configuration document if it does not already exist.
 *     tags:
 *       - Config
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: email@email.com 
 *               token:
 *                 type: string
 *                 example: LOKADFBIAlASJLDAS
 *               checkInterval:
 *                 type: integer
 *                 example: 1440
 *     responses:
 *       200:
 *         description: Configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example: { type: "config", email: "email@email.com", token: "LOKADFBIAlASJLDAS", checkInterval: 1440, "_id": "IdkIAFkbadsoIDSF" }
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing or invalid "email" field in request body. Please provide a valid "email"
 *       401:
 *         description: Unauthorized - incorrect CloudFlare credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 401
 *                 error:
 *                   type: string
 *                   example: Incorrect CloudFlare credentials
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Forbidden
 *       409:
 *         description: Conflict - configuration already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Config already exist
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.post('/', async (req, res) => {
    const { email, token, checkInterval } = req.body;
    const externalIp = await getExternalIP();

    if (!email) {
        return res.status(400).json({ error: 'Missing or invalid "email" field in request body. Please provide a valid "email"' });
    }
    if (!token) {
        return res.status(400).json({ error: 'Missing or invalid "token" field in request body. Please provide a valid "token"' });
    }
    if (!checkInterval) {
        return res.status(400).json({ error: 'Missing or invalid "checkInterval" field in request body. Please provide a valid "checkInterval"' });
    }

    const auth = await checkAuth(email, token);
    if (!auth) {
        return res.status(401).json({ status: 401, error: 'Incorrect CloudFlare credentials' });
    }
    
    updateInterval(checkInterval);

    getExternalIP()
    .then((externalIP) => {
        findDocuments({ type: "config" }, (err, docs) => {
            if (!err) {
                if ( docs[0] ) {
                    res.status(409).json({ message: 'Config already exist' });
                } else {
                    insertDocument({ type: "config", email, token, checkInterval, lastIp: externalIp }, (err, newConfig) => {
                        if (!err) {
                            res.status(200).json({ data: newConfig });
                        } else {
                            res.status(500).json({ error: err });
                        }
                    });
                }
            } else {
                res.status(500).json({ error: err });
            }
        });
    })
    .catch((error) => {
        res.status(500).json({ error: error.message });
    });    
});

module.exports = router;