const express = require('express');
const router = express.Router();
const { getData, getWilayah, getTahun } = require('../controllers/dataController');

router.get('/data', getData);
router.get('/wilayah', getWilayah);
router.get('/tahun', getTahun);

module.exports = router;