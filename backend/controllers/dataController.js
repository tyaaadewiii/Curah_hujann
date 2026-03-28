const { getDataByFilter, getWilayahList, getTahunList } = require('../services/dataService');

const getData = async (req, res) => {
  try {
    const { wilayah, tahun } = req.query;
    const result = await getDataByFilter({ wilayah, tahun });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error getData:', err.message);
    res.status(500).json({ success: false, message: 'Gagal memuat data', error: err.message });
  }
};

const getWilayah = async (req, res) => {
  try {
    const wilayah = await getWilayahList();
    res.json({ success: true, data: wilayah });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat wilayah', error: err.message });
  }
};

const getTahun = async (req, res) => {
  try {
    const tahun = await getTahunList();
    res.json({ success: true, data: tahun });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat tahun', error: err.message });
  }
};

module.exports = { getData, getWilayah, getTahun };