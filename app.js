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

function showTab(tab){
  document.getElementById("lagerTab").style.display = tab==="lager"?"block":"none";
  document.getElementById("draussenTab").style.display = tab==="draussen"?"block":"none";
}


// ➕ Gerät hinzufügen
function addDevice(){
  const name = document.getElementById("name").value;
  const lager = document.getElementById("lager").value;
  const regal = document.getElementById("regal").value;
  const anzahl = parseInt(document.getElementById("anzahl").value);

  if(!name || !lager || !regal || !anzahl){
    alert("Alles ausfüllen!");
    return;
  }

  const id = Date.now();

  db.ref("geraete/"+id).set({
    id,
    name,
    lager,
    regal,
    anzahlGesamt: anzahl,
    anzahlLager: anzahl
  });

  document.querySelectorAll("input").forEach(i=>i.value="");
}


// 🔄 Realtime Anzeige
db.ref("geraete").on("value", snap=>{
  const data = snap.val() || {};
  lagerTab.innerHTML = "";
  draussenTab.innerHTML = "";

  Object.values(data).forEach(d=>{
    const imLager = d.anzahlLager > 0;

    const div = document.createElement("div");
    div.className = "card";
    div.style.borderLeft = `10px solid ${imLager ? "green" : "red"}`;

    // 🔽 Checkout Dropdown (1 bis Lagerbestand)
    let checkoutDropdown = "";
    if(d.anzahlLager > 0){
      checkoutDropdown = `
        <select id="out${d.id}">
          ${Array.from({length: d.anzahlLager}, (_, i) =>
            `<option value="${i+1}">${i+1}</option>`
          ).join("")}
        </select>
        <button onclick="checkout(${d.id})">Auschecken</button>
      `;
    } else {
      checkoutDropdown = `<i>Kein Bestand im Lager</i>`;
    }

    // 🔼 Checkin Dropdown (1 bis fehlende Menge)
    const fehlend = d.anzahlGesamt - d.anzahlLager;
    let checkinDropdown = "";
    if(fehlend > 0){
      checkinDropdown = `
        <select id="in${d.id}">
          ${Array.from({length: fehlend}, (_, i) =>
            `<option value="${i+1}">${i+1}</option>`
          ).join("")}
        </select>
        <button onclick="checkin(${d.id})">Zurückbringen</button>
      `;
    } else {
      checkinDropdown = `<i>Alles im Lager</i>`;
    }

    div.innerHTML = `
      <b>${d.name}</b><br>
      Lager: ${d.lager} | Regal: ${d.regal}<br>
      <b>Im Lager: ${d.anzahlLager} / ${d.anzahlGesamt}</b><br><br>

      ${checkoutDropdown}
      <br><br>
      ${checkinDropdown}

      <br><br>
      <button onclick="deleteDevice(${d.id})" style="background:red;color:white;">
        Gerät löschen
      </button>

      <div id="qr${d.id}" style="margin-top:10px;"></div>
    `;

    if(imLager){
      lagerTab.appendChild(div);
    } else {
      draussenTab.appendChild(div);
    }

    new QRCode(document.getElementById(`qr${d.id}`),{
      text: String(d.id),
      width: 100,
      height: 100
    });
  });
});


// ➖ Auschecken
function checkout(id){
  const menge = parseInt(document.getElementById("out"+id).value);

  db.ref("geraete/"+id).once("value").then(snap=>{
    const d = snap.val();
    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager - menge
    });
  });
}


// ➕ Zurückbringen
function checkin(id){
  const menge = parseInt(document.getElementById("in"+id).value);

  db.ref("geraete/"+id).once("value").then(snap=>{
    const d = snap.val();
    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager + menge
    });
  });
}


// 🗑 Löschen
function deleteDevice(id){
  if(confirm("Gerät wirklich löschen?")){
    db.ref("geraete/"+id).remove();
  }
}
