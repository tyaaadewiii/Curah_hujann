const wilayahSelect = document.getElementById('sel-wilayah');
const tahunSelect = document.getElementById('sel-tahun');

const avgRain = document.getElementById('kpi-avg');
const maxRain = document.getElementById('kpi-max');
const minRain = document.getElementById('kpi-min');

const tableBody = document.getElementById('table-body');
const loading = document.getElementById('chart-loading');

let rainChart;

const namaBulan = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

async function loadWilayah() {
  const res = await fetch('/api/wilayah');
  const result = await res.json();
  const data = result.data || result;

  wilayahSelect.innerHTML = '';

  data.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    wilayahSelect.appendChild(opt);
  });

  if (data.length > 0) {
    loadChart(data[0]);
  }
}

function loadTahun() {
  for (let i = 2015; i <= 2025; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    tahunSelect.appendChild(opt);
  }
}

async function loadChart(wilayah) {
  try {
    loading.classList.remove('hidden');

    const tahun = tahunSelect.value || '';

    const res = await fetch(`/api/data?wilayah=${wilayah}&tahun=${tahun}`);
    const result = await res.json();
    const data = result.data;

    const histori = data.histori;
    const prediksi = data.prediksi;

    const labels = histori.map(d => namaBulan[d.bulan - 1]);
    const hVals = histori.map(d => d.rata_rata || 0);
    const pVals = prediksi.map(d => d.rata_rata || 0);

    avgRain.textContent = data.kpi.rata_rata;
    maxRain.textContent = data.kpi.maksimum;
    minRain.textContent = data.kpi.minimum;

    const ctx = document.getElementById('rain-chart').getContext('2d');

    if (rainChart) rainChart.destroy();

    rainChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Historis',
            data: hVals,
            borderColor: '#38b6d8',
            tension: 0.3
          },
          {
            label: 'Prediksi 2026',
            data: pVals,
            borderColor: '#e5484d',
            borderDash: [6,6],
            tension: 0.3
          }
        ]
      }
    });

    tableBody.innerHTML = '';
    const maxVal = Math.max(...hVals);

    histori.forEach((h, i) => {
      const p = prediksi[i];

      tableBody.innerHTML += `
        <tr>
          <td class="td-month">${namaBulan[h.bulan - 1]}</td>

          <td class="td-value histori">${h.rata_rata}</td>

          <td class="td-value prediksi">
            ${p?.rata_rata ?? '<span class="null-val">-</span>'}
          </td>

          <td class="td-bar">
            <div class="bar-bg">
              <div class="bar-fill histori"
                style="width:${(h.rata_rata / maxVal) * 100}%">
              </div>
            </div>
          </td>

          <td>
            <span class="badge-tipe ${h.tipe}">
              ${h.tipe}
            </span>
          </td>
        </tr>
      `;
    });

    const insight = document.getElementById('insight-text');
    if (insight) {
      const maxMonth = labels[hVals.indexOf(Math.max(...hVals))];
      insight.textContent = `Curah hujan tertinggi terjadi pada bulan ${maxMonth}`;
    }

    loading.classList.add('hidden');

  } catch (err) {
    console.error("Error:", err);
  }
}

wilayahSelect.addEventListener('change', () => {
  loadChart(wilayahSelect.value);
});

tahunSelect.addEventListener('change', () => {
  loadChart(wilayahSelect.value);
});

document.addEventListener("DOMContentLoaded", () => {
  loadWilayah();
  loadTahun();
});