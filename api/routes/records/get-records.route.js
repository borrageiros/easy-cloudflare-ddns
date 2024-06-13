const express = require('express');
const router = express.Router();
const { findDocuments } = require('../../../database/db');

console.log("🆗 /record GET");

/**
 * @swagger
 * /api/record:
 *   get:
 *     summary: Get all records
 *     description: Retrieve all records from the database.
 *     tags:
 *       - Record
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60c5f16f45a3a448e0c99e18
 *                       type:
 *                         type: string
 *                         example: record
 *                       name:
 *                         type: string
 *                         example: ddns.borrageiros.com
 *                       zoneId:
 *                         type: string
 *                         example: asdibLSLJihbJKCVkuiflikjb
 *                       proxy:
 *                         type: boolean
 *                         example: true
 *                       ttl:
 *                         type: ingeger
 *                         example: 0
 *                       recordId:
 *                         type: string
 *                         example: akIKGvuhKJHGkjvJlkGHKjgLK
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Unauthorized
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