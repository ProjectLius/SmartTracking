import { db, ref, set } from './firebase.js';

const startBtn = document.getElementById('startBtn');
const statusText = document.getElementById('status');

startBtn.addEventListener('click', () => {

  const name = document.getElementById('name').value;

  if (!name) {
    alert('Masukkan nama dulu');
    return;
  }

  if (navigator.geolocation) {

    navigator.geolocation.watchPosition((position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      set(ref(db, 'users/' + name), {
        name,
        lat,
        lng,
        updatedAt: Date.now()
      });

      statusText.innerText = `Lokasi terkirim: ${lat}, ${lng}`;

    });

  } else {
    alert('Browser tidak support geolocation');
  }
});