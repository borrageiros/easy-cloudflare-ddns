const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('./jwt-config');
const getRecords = require('./routes/records/get-records.route');
const insertRecord = require('./routes/records/insert-record.route');
const deleteRecord = require('./routes/records/delete-record.route');
const updateRecord = require('./routes/records/update-record.route');
const getConfig = require('./routes/config/get-config.route');
const insertConfig = require('./routes/config/insert-config.route');
const updateConfig = require('./routes/config/update-config.route');
const getZones = require('./routes/zones/get-zones.route');
const insertZone = require('./routes/zones/insert-zone.route');
const deleteZone = require('./routes/zones/delete-zone.route');
const login = require('./routes/auth/login.route');
const app = require('./routes/app/get-app-status.route');
const generateApiToken = require('./routes/auth/generate-api-token.route');
const togglePauseInterval = require('./routes/app/toggle-pause-interval.route');
const forceInterval = require('./routes/app/force-interval.route');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    jwt.verify(authHeader, getJwtSecret(), (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

router.use('/record', authenticateJWT,getRecords);
router.use('/record', authenticateJWT,insertRecord);
router.use('/record', authenticateJWT,updateRecord);
router.use('/record', authenticateJWT,deleteRecord);

router.use('/config', authenticateJWT, getConfig);
router.use('/config', authenticateJWT, insertConfig);
router.use('/config', authenticateJWT, updateConfig);

router.use('/zone', authenticateJWT, getZones);
router.use('/zone', authenticateJWT, insertZone);
router.use('/zone', authenticateJWT, deleteZone);

router.use('/login', login);
router.use('/app', authenticateJWT, app);
router.use('/generate-api-token', authenticateJWT, generateApiToken);
router.use('/toggle-pause-interval', authenticateJWT, togglePauseInterval);
router.use('/force-interval', authenticateJWT, forceInterval);

module.exports = router;
