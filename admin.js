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
  "#3b82f6",
  "#ef4444",
  "#22c55e",
  "#f59e0b",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#f97316",
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
        animation:pulse 1.5s infinite;
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
   HITUNG JARAK GPS
========================= */

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;

  const Δφ = ((lat2 - lat1) * Math.PI) / 180;

  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* =========================
   LOAD DATA
========================= */

async function loadLocations() {
  try {
    const response = await fetch(API_URL);

    const data = await response.json();

    console.log("DATA:", data);

    /* TOTAL USER */

    document.getElementById("totalUsers").innerHTML = data.length;

    /* LOOP USER */

    data.forEach((user) => {
      const lat = parseFloat(user.latitude);

      const lng = parseFloat(user.longitude);

      const nama = user.nama;

      /* VALIDASI */

      if (isNaN(lat) || isNaN(lng)) return;

      /* STATUS ONLINE */

      let isOnline = false;

      if (user.timestamp) {
        const lastUpdate = Date.now() - user.timestamp;

        isOnline = lastUpdate < 15000;
      }

      const statusText = isOnline ? "🟢 ONLINE" : "🔴 OFFLINE";

      /* WARNA USER */

      const userColor = getUserColor(nama);

      /* =========================
         UPDATE MARKER
      ========================= */

      if (markers[nama]) {
        /* GERAKKAN MARKER */

        markers[nama].setLatLng([lat, lng]);

        /* UPDATE POPUP */

        markers[nama].setPopupContent(`

          <div style="
            min-width:180px;
          ">

            <h3 style="
              margin-bottom:10px;
              color:${userColor};
            ">
              🚗 ${nama}
            </h3>

            <p>
              ${statusText}
            </p>

            <hr style="
              margin:10px 0;
              border:none;
              border-top:1px solid #334155;
            ">

            <p>
              <b>Latitude:</b><br>
              ${lat}
            </p>

            <p style="
              margin-top:8px;
            ">
              <b>Longitude:</b><br>
              ${lng}
            </p>

          </div>

        `);

        /* =========================
           FILTER GPS NOISE
        ========================= */

        const lastPoint = paths[nama][paths[nama].length - 1];

        const distance = calculateDistance(
          lastPoint[0],
          lastPoint[1],
          lat,
          lng,
        );

        /* JIKA PINDAH > 3 METER */

        if (distance > 3) {
          paths[nama].push([lat, lng]);

          /* BATASI MEMORY */

          if (paths[nama].length > 100) {
            paths[nama].shift();
          }

          /* UPDATE GARIS */

          polylines[nama].setLatLngs(paths[nama]);
        }
      } else {
        /* =========================
           MARKER BARU
        ========================= */

        const marker = L.marker([lat, lng], {
          icon: createCarIcon(userColor),
        }).addTo(map);

        /* POPUP */

        marker.bindPopup(`

          <div style="
            min-width:180px;
          ">

            <h3 style="
              margin-bottom:10px;
              color:${userColor};
            ">
              🚗 ${nama}
            </h3>

            <p>
              ${statusText}
            </p>

            <hr style="
              margin:10px 0;
              border:none;
              border-top:1px solid #334155;
            ">

            <p>
              <b>Latitude:</b><br>
              ${lat}
            </p>

            <p style="
              margin-top:8px;
            ">
              <b>Longitude:</b><br>
              ${lng}
            </p>

          </div>

        `);

        /* SIMPAN MARKER */

        markers[nama] = marker;

        /* PATH AWAL */

        paths[nama] = [[lat, lng]];

        /* GARIS */

        polylines[nama] = L.polyline(paths[nama], {
          color: userColor,
          weight: 5,
          opacity: 0.8,
          smoothFactor: 1,
        }).addTo(map);

        /* AUTO FOCUS */

        map.flyTo([lat, lng], 15, {
          animate: true,
          duration: 1.5,
        });
      }

      /* =========================
         USER LIST
      ========================= */

      if (!usersRendered[nama]) {
        const userItem = document.createElement("div");

        userItem.classList.add("user-item");

        userItem.id = `user-${nama}`;

        userItem.innerHTML = `

          <div
            class="user-dot"
            style="
              background:${userColor};
              width:14px;
              height:14px;
              border-radius:50%;
              box-shadow:0 0 10px ${userColor};
            "
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

        /* STYLE */

        userItem.style.display = "flex";

        userItem.style.alignItems = "center";

        userItem.style.gap = "12px";

        userItem.style.padding = "12px";

        userItem.style.marginTop = "10px";

        userItem.style.borderRadius = "14px";

        userItem.style.cursor = "pointer";

        userItem.style.background = "rgba(255,255,255,0.05)";

        userItem.style.transition = "0.3s";

        /* HOVER */

        userItem.addEventListener("mouseenter", () => {
          userItem.style.transform = "translateX(5px)";
        });

        userItem.addEventListener("mouseleave", () => {
          userItem.style.transform = "translateX(0px)";
        });

        /* CLICK FOCUS */

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
        /* UPDATE STATUS */

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
