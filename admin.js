/* =========================
   ADMIN MAP
========================= */

const map = L.map("map").setView([-6.2, 106.816666], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

/* =========================
   GOOGLE SHEET API
========================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyZTlXf_rCzYHqvJpeRTtHn2adlRkIVZ4jms_W2VxnlbBA1rcp3hXY_c73vrbFOpw6qNA/exec";

/* =========================
   ICON MOBIL
========================= */

const carIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",

  iconSize: [45, 45],

  iconAnchor: [22, 22],
});

/* =========================
   SIMPAN MARKER
========================= */

let markers = {};

let polylines = {};

let paths = {};

/* =========================
   AMBIL DATA USER
========================= */

async function loadLocations() {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    document.getElementById("totalUsers").innerHTML = data.length;

    console.log(data);

    data.forEach((user) => {
      const lat = parseFloat(user.latitude);

      const lng = parseFloat(user.longitude);

      const nama = user.nama;

      /* CEK KOORDINAT VALID */

      if (!lat || !lng) return;

      /* JIKA MARKER SUDAH ADA */

      if (markers[nama]) {
        markers[nama].setLatLng([lat, lng]);
        paths[nama].push([lat, lng]);

        /* UPDATE GARIS */

        polylines[nama].setLatLngs(paths[nama]);
      } else {
        /* JIKA BELUM ADA */
        const marker = L.marker([lat, lng], {
          icon: carIcon,
        }).addTo(map);

        const lastUpdate = Date.now() - user.timestamp;

        const isOnline = lastUpdate < 15000;

        const statusText = isOnline ? "🟢 ONLINE" : "🔴 OFFLINE";

        marker.bindPopup(`
  <b>${user.nama}</b><br>
  ${statusText}<br><br>
  Latitude: ${user.latitude}<br>
  Longitude: ${user.longitude}
`);

        markers[nama] = marker;
        /* SIMPAN TITIK PERTAMA */

        paths[nama] = [[lat, lng]];

        /* BUAT GARIS */

        polylines[nama] = L.polyline(paths[nama], {
          color: "#3b82f6",

          weight: 5,

          opacity: 0.8,

          smoothFactor: 1,
        }).addTo(map);
      }
    });
  } catch (error) {
    console.log("ERROR:", error);
  }
}

/* =========================
   LOAD PERTAMA
========================= */

loadLocations();

/* =========================
   AUTO REFRESH REALTIME
========================= */

setInterval(() => {
  loadLocations();
}, 3000);
