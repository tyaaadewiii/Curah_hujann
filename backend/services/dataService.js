const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const filePath = path.join(__dirname, '../data/gabungan_histori_prediksi.csv');

const readCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath) 
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          tanggal: row.ds ? row.ds.trim() : '', 
          wilayah: row.wilayah ? row.wilayah.trim() : '',
          curah_hujan: parseFloat(row.curah_hujan) || 0,
          tipe: row.tipe ? row.tipe.trim() : ''
        });
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const filterData = (data, { wilayah, tahun }) => {
  return data.filter((row) => {
    const dateObj = new Date(row.tanggal);
    const rowTahun = dateObj.getFullYear().toString();
    const matchWilayah = wilayah ? row.wilayah === wilayah : true;
    const matchTahun = tahun ? rowTahun === tahun : true;
    return matchWilayah && matchTahun;
  });
};

const groupByMonth = (data) => {
  const monthMap = {};
  data.forEach((row) => {
    const date = new Date(row.tanggal);
    const month = date.getMonth() + 1;
    const key = `${month}`;
    if (!monthMap[key]) {
      monthMap[key] = { total: 0, count: 0, tipe: row.tipe };
    }
    monthMap[key].total += row.curah_hujan;
    monthMap[key].count += 1;
  });

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  return months.map((m) => {
    const entry = monthMap[m.toString()];
    return {
      bulan: m,
      rata_rata: entry ? parseFloat((entry.total / entry.count).toFixed(2)) : null,
      tipe: entry ? entry.tipe : null
    };
  });
};

const getWilayahList = async () => {
  const data = await readCSV();
  const unique = [...new Set(data.map((r) => r.wilayah))].sort();
  return unique;
};

const getTahunList = async () => {
  const data = await readCSV();
  const unique = [...new Set(data.map((r) => new Date(r.tanggal).getFullYear()))].sort();
  return unique;
};

const getDataByFilter = async ({ wilayah, tahun }) => {
  const all = await readCSV();

  const histori = filterData(all, { wilayah, tahun: tahun && tahun !== '2026' ? tahun : null }).filter(
    (r) => r.tipe === 'histori'
  );
  const prediksi = filterData(all, { wilayah, tahun: '2026' }).filter((r) => r.tipe === 'prediksi');

  const groupedHistori = groupByMonth(histori);
  const groupedPrediksi = groupByMonth(prediksi);

  const allValues = [...histori, ...prediksi].map((r) => r.curah_hujan);
  const rata_rata = allValues.length
    ? parseFloat((allValues.reduce((a, b) => a + b, 0) / allValues.length).toFixed(2))
    : 0;
  const maksimum = allValues.length ? parseFloat(Math.max(...allValues).toFixed(2)) : 0;
  const minimum = allValues.length ? parseFloat(Math.min(...allValues).toFixed(2)) : 0;

  return {
    histori: groupedHistori,
    prediksi: groupedPrediksi,
    kpi: { rata_rata, maksimum, minimum },
    raw: {
      histori: histori.slice(0, 500),
      prediksi
    }
  };
};

module.exports = { getDataByFilter, getWilayahList, getTahunList };