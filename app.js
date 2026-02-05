const firebaseConfig = {
  apiKey: "AIzaSyBPLG5oY9yGfrd3UC_FqTmZgDNaOHCHMKU",
  authDomain: "lagerverwaltung-d9fba.firebaseapp.com",
  databaseURL: "https://lagerverwaltung-d9fba-default-rtdb.firebaseio.com",
  projectId: "lagerverwaltung-d9fba",
  storageBucket: "lagerverwaltung-d9fba.firebasestorage.app",
  messagingSenderId: "72909186161",
  appId: "1:72909186161:web:f29f1b16c3dafc2f6027d0",
  measurementId: "G-75HWSJ12RS"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Gerät hinzufügen
function addDevice() {
  const name = document.getElementById("name").value;
  const lager = document.getElementById("lager").value;
  const regal = document.getElementById("regal").value;

  if (!name || !lager || !regal) {
    alert("Bitte alles ausfüllen");
    return;
  }

  const id = Date.now();
  db.ref("geraete/" + id).set({
    id, name, lager, regal, imLager: true
  });

  document.getElementById("name").value = "";
  document.getElementById("lager").value = "";
  document.getElementById("regal").value = "";
}

// Realtime Sync
db.ref("geraete").on("value", snap => {
  const data = snap.val() || {};
  const list = document.getElementById("list");
  list.innerHTML = "";

  Object.values(data).forEach(d => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.borderLeft = `10px solid ${d.imLager ? "green" : "red"}`;

    div.innerHTML = `
      <b>${d.name}</b><br>
      Lager: ${d.lager} | Regal: ${d.regal}<br>
      <button onclick="toggle(${d.id}, ${!d.imLager})">
        ${d.imLager ? "Auschecken" : "Zurück"}
      </button>
      <div id="qr${d.id}"></div>
    `;

    list.appendChild(div);

    new QRCode(document.getElementById(`qr${d.id}`), {
      text: JSON.stringify(d),
      width: 100,
      height: 100
    });
  });
});

// Status ändern
function toggle(id, status) {
  db.ref("geraete/" + id).update({ imLager: status });
}

// QR Scan
function startScan() {
  const qr = new Html5Qrcode("reader");

  qr.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    msg => {
      const d = JSON.parse(msg);
      const scanResult = document.getElementById("scanResult");
      scanResult.innerHTML = `
        <h3>${d.name}</h3>
        Lager: ${d.lager}<br>
        Regal: ${d.regal}
      `;
      qr.stop();
    }
  );
}