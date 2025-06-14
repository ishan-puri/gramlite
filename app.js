import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDjXZJU7xgMDqE8h_FlcxR-8kjtQpE73FE",
  authDomain: "streamcamera-a78e7.firebaseapp.com",
  projectId: "streamcamera-a78e7",
  storageBucket: "streamcamera-a78e7.firebasestorage.app",
  messagingSenderId: "762666852131",
  appId: "1:762666852131:web:b5bc83cb496464b32bf696",
  measurementId: "G-JS1W80S9QF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("alertsContainer");
const siren = document.getElementById("siren");
const soundPrompt = document.getElementById("soundPrompt");
let soundEnabled = false;

// 🔊 One-time click to unlock siren sound
soundPrompt.addEventListener("click", () => {
  siren.play().then(() => {
    soundEnabled = true;
    soundPrompt.remove();
    console.log("Siren sound enabled!");
  }).catch(err => {
    alert("Please click again to enable sound.");
  });
});

const cardMap = new Map();

onSnapshot(collection(db, "alerts"), async (snapshot) => {
  snapshot.forEach(async (docSnap) => {
    const data = docSnap.data();
    const docId = docSnap.id;
    const formattedTime = formatTimestamp(data.timestamp);

    let card;
    if (cardMap.has(docId)) {
      card = cardMap.get(docId);
      card.querySelector(".device").textContent = `Device ID: ${docId}`;
      card.querySelector(".timestamp").textContent = `Time: ${formattedTime}`;
    } else {
      card = document.createElement("div");
      card.className = "alert-card";
      card.id = `card-${docId}`;
      card.innerHTML = `
        <h2>📍 ${data.location}</h2>
        <p class="device">Device ID: ${docId}</p>
        <p class="timestamp">Time: ${formattedTime}</p>
      `;
      container.appendChild(card);
      cardMap.set(docId, card);
    }

    if (data.alert === 1) {
      card.classList.add("active");

      // 🚨 Play siren if unlocked
      if (soundEnabled) {
        siren.play().catch(e => console.warn("Siren blocked by browser:", e));
      }

      showPopup(`🚨 ALERT from ${data.location}`);

      setTimeout(async () => {
        const docRef = doc(db, "alerts", docId);
        await updateDoc(docRef, { alert: 0 });
      }, 10000); // 10 sec
    } else {
      card.classList.remove("active");
    }
  });
});

function formatTimestamp(ts) {
  try {
    if (ts && ts.toDate) {
      const date = ts.toDate();
      return date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    }
    return "Invalid Date";
  } catch {
    return "Invalid Date";
  }
}

function showPopup(message) {
  const popup = document.createElement("div");
  popup.className = "popup";
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 4000);
}