const express = require('express');
const router = express.Router();
const GeoController = require('../controllers/geoController');

router.get('/producers', GeoController.getProducers);
router.get('/markets', GeoController.getMarkets);

module.exports = router;
