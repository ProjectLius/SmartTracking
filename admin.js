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
   USER LIST
========================= */

const userList = document.getElementById("userList");

/* =========================
   WARNA USER
========================= */

const userColors = {};

const colors = [
  "#3b82f6", // biru
  "#ef4444", // merah
  "#22c55e", // hijau
  "#f59e0b", // kuning
  "#a855f7", // ungu
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

/* =========================
   AMBIL WARNA USER
========================= */

function getUserColor(nama) {
  if (!userColors[nama]) {
    const randomColor = colors[Object.keys(userColors).length % colors.length];

    userColors[nama] = randomColor;
  }

  return userColors[nama];
}

/* =========================
   CUSTOM MARKER
========================= */

function createCarIcon(color) {
  return L.divIcon({
    className: "custom-car",

    html: `
      <div style="
        background:${color};
        width:20px;
        height:20px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 0 15px ${color};
      "></div>
    `,

    iconSize: [20, 20],
  });
}

/* =========================
   STORAGE
========================= */

let markers = {};

let polylines = {};

let paths = {};

let usersRendered = {};

/* =========================
   LOAD DATA
========================= */

async function loadLocations() {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    console.log("DATA:", data);

    /* =========================
       TOTAL USER
    ========================= */

    document.getElementById("totalUsers").innerHTML = data.length;

    /* =========================
       LOOP USER
    ========================= */

    data.forEach((user) => {
      const lat = parseFloat(user.latitude);

      const lng = parseFloat(user.longitude);

      const nama = user.nama;

      /* VALIDASI */

      if (isNaN(lat) || isNaN(lng)) return;

      /* =========================
         STATUS ONLINE
      ========================= */

      let isOnline = false;

      if (user.timestamp) {
        const lastUpdate = Date.now() - user.timestamp;

        isOnline = lastUpdate < 15000;
      }

      const statusText = isOnline ? "🟢 ONLINE" : "🔴 OFFLINE";

      /* =========================
         USER COLOR
      ========================= */

      const userColor = getUserColor(nama);

      /* =========================
         UPDATE MARKER
      ========================= */

      if (markers[nama]) {
        /* GERAKKAN MARKER */

        markers[nama].setLatLng([lat, lng]);

        /* UPDATE POPUP */

        markers[nama].setPopupContent(`
          <b>${nama}</b><br>
          ${statusText}<br><br>
          Latitude: ${lat}<br>
          Longitude: ${lng}
        `);

        /* UPDATE PATH */

        paths[nama].push([lat, lng]);

        /* UPDATE GARIS */

        polylines[nama].setLatLngs(paths[nama]);
      } else {
        /* =========================
           MARKER BARU
        ========================= */

        const marker = L.marker([lat, lng], {
          icon: createCarIcon(userColor),
        }).addTo(map);

        /* POPUP */

        marker.bindPopup(`
          <b>${nama}</b><br>
          ${statusText}<br><br>
          Latitude: ${lat}<br>
          Longitude: ${lng}
        `);

        /* SIMPAN MARKER */

        markers[nama] = marker;

        /* =========================
           PATH AWAL
        ========================= */

        paths[nama] = [[lat, lng]];

        /* =========================
           POLYLINE
        ========================= */

        polylines[nama] = L.polyline(paths[nama], {
          color: userColor,
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1,
        }).addTo(map);

        /* =========================
           AUTO FOCUS
        ========================= */

        map.flyTo([lat, lng], 15, {
          animate: true,
          duration: 1.5,
        });
      }

      /* =========================
         LIVE USER LIST
      ========================= */

      if (!usersRendered[nama]) {
        const userItem = document.createElement("div");

        userItem.classList.add("user-item");

        userItem.id = `user-${nama}`;

        userItem.innerHTML = `

          <div
            class="user-dot"
            style="background:${userColor}"
          ></div>

          <div class="user-info">

            <div class="user-name">
              ${nama}
            </div>

            <div class="user-status">
              ${statusText}
            </div>

          </div>
        `;

        /* =========================
           CLICK FOCUS
        ========================= */

        userItem.addEventListener("click", () => {
          map.flyTo([lat, lng], 17, {
            animate: true,
            duration: 1.5,
          });

          markers[nama].openPopup();
        });

        userList.appendChild(userItem);

        usersRendered[nama] = true;
      } else {
        /* =========================
           UPDATE STATUS
        ========================= */

        const statusElement = document.querySelector(
          `#user-${nama} .user-status`,
        );

        if (statusElement) {
          statusElement.innerHTML = statusText;
        }
      }
    });
  } catch (error) {
    console.log("ERROR ADMIN:", error);
  }
}

/* =========================
   LOAD PERTAMA
========================= */

loadLocations();

/* =========================
   REALTIME REFRESH
========================= */

setInterval(() => {
  loadLocations();
}, 3000);
