import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUFCWYOdTXv7chCIpI7FCC6YQbaLzZODY",

  authDomain: "tracking-komunitas.firebaseapp.com",

  databaseURL:
    "https://tracking-komunitas-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "tracking-komunitas",

  storageBucket: "tracking-komunitas.firebasestorage.app",

  messagingSenderId: "440015903444",

  appId: "1:440015903444:web:9ab01e2a5fb884a7d9b941",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue };
