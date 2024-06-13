const express = require('express');
const router = express.Router();
const { updateDocument, findDocuments } = require('../../../database/db');
const { updateInterval } = require('../../check-interval');
const getExternalIP = require('../../get-external-ip');
const { checkAuth } = require('../../cloudflare-api');

console.log("🆗 /config PUT");

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Update configuration
 *     description: Update an existing configuration document.
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
 *         description: Document updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Document updated successfully
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
 *                   example: Missing field to update in request body. Please provide a valid "email", "token" or "checkInterval"
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
 *       404:
 *         description: Config not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Config not found
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

router.put('/', async (req, res) => {
    const { email, token, checkInterval } = req.body;
    
    if (!email && !token) {
        return res.status(400).json({ error: 'Missing field to update in request body. Please provide a valid "email", "token" or "checkInterval""' });
    }
    
    const auth = await checkAuth(email, token);
    if (!auth) {
        return res.status(401).json({ status: 401, error: 'Incorrect CloudFlare credentials' });
    }

    const query = { type: "config" };

    const update = {};
    if (email) update.email = email;
    if (token) update.token = token;
    if ( checkInterval ) {
        update.checkInterval = checkInterval;
        updateInterval(checkInterval);
    }

    getExternalIP()
        .then((externalIP) => {
            update.lastIp = externalIP;

            const options = { multi: false };

            updateDocument(query, { $set: update }, options, (err, numAffected, affectedDocuments, upsert) => {
                if (!err) {
                    if (numAffected === 0) {
                        return res.status(404).json({ error: 'Config not found' });
                    }
                    findDocuments(query, (err, newDoc) => {
                        if (!err) {
                            res.status(200).json({ message: 'Document updated successfully', affectedDocuments, data: newDoc[0] });
                        } else {
                            res.status(500).json({ error: err });
                        }
                    });
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