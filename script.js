/* =========================
   HAMBURGER MENU
========================= */

const hamburger = document.getElementById("hamburger");

const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

/* AUTO CLOSE MENU */

const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("active");
  });
});

/* =========================
   NAVBAR SCROLL EFFECT
========================= */

let lastScroll = 0;

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  if (window.innerWidth <= 768) {
    const currentScroll = window.pageYOffset;

    /* SCROLL KE BAWAH */

    if (currentScroll > lastScroll && currentScroll > 50) {
      navbar.classList.add("hide-navbar");
    } else {
      /* SCROLL KE ATAS */
      navbar.classList.remove("hide-navbar");
    }

    lastScroll = currentScroll;
  }
});

/* =========================
   MAP
========================= */

const map = L.map("map").setView([-6.2, 106.816666], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

/* =========================
   ICON MOBIL
========================= */

const carIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",

  iconSize: [50, 50],

  iconAnchor: [25, 25],
});

/* =========================
   MARKER
========================= */

let carMarker;

/* =========================
   BUTTON TRACKING
========================= */

const startBtn = document.querySelector(".primary-btn");
const usernameInput = document.getElementById("username");

startBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Masukkan nama terlebih dahulu!");

    return;
  }
  if (navigator.geolocation) {
    startBtn.innerHTML = "Mengaktifkan Tracking...";

    startBtn.disabled = true;

    navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;

        const lng = position.coords.longitude;

        console.log(lat, lng);

        /* =========================
           KIRIM KE GOOGLE SHEETS
        ========================= */

        fetch(
          "https://script.google.com/macros/s/AKfycbyZTlXf_rCzYHqvJpeRTtHn2adlRkIVZ4jms_W2VxnlbBA1rcp3hXY_c73vrbFOpw6qNA/exec",
          {
            method: "POST",

            body: JSON.stringify({
              nama: namaUser,
              latitude: lat,
              longitude: lng,
              updatedAt: Date.now(),
              timestamp: Date.now(),
            }),
          },
        )
          .then((response) => response.json())

          .then((data) => {
            console.log("Berhasil kirim:", data);
          })

          .catch((error) => {
            console.log("Error:", error);
          });

        /* =========================
           MAP FOLLOW
        ========================= */

        map.flyTo([lat, lng], 17, {
          animate: true,
          duration: 1.5,
        });

        /* =========================
           MARKER PERTAMA
        ========================= */

        if (!carMarker) {
          carMarker = L.marker([lat, lng], {
            icon: carIcon,
          }).addTo(map);

          /* NOTIFIKASI */

          const notif = document.createElement("div");

          notif.classList.add("notif");

          notif.innerHTML = `
            <h3>Tracking Aktif 🚗</h3>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lng}</p>
          `;

          document.body.appendChild(notif);

          setTimeout(() => {
            notif.remove();
          }, 4000);
        } else {
          /* =========================
           GERAKKAN MOBIL
        ========================= */
          carMarker.setLatLng([lat, lng]);
        }

        startBtn.innerHTML = "Tracking Aktif ✅";
      },

      (error) => {
        console.log(error);

        alert("ERROR: " + error.message);

        startBtn.innerHTML = "Gagal Tracking ❌";

        startBtn.disabled = false;
      },

      {
        enableHighAccuracy: true,

        maximumAge: 0,

        timeout: 5000,
      },
    );
  } else {
    alert("Browser tidak mendukung geolocation");
  }
});
