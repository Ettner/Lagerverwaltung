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
  const name = nameInput.value;
  const lager = lagerInput.value;
  const regal = regalInput.value;
  const anzahl = parseInt(anzahlInput.value);

  if(!name || !lager || !regal || !anzahl){
    alert("Alles ausfüllen!");
    return;
  }

  const id = Date.now();

  db.ref("geraete/"+id).set({
    id, name, lager, regal,
    anzahlGesamt: anzahl,
    anzahlLager: anzahl
  });

  document.querySelectorAll("input").forEach(i=>i.value="");
}


// 🔄 Anzeige
db.ref("geraete").on("value", snap=>{
  const data = snap.val() || {};
  lagerTab.innerHTML="";
  draussenTab.innerHTML="";

  Object.values(data).forEach(d=>{
    const imLager = d.anzahlLager > 0;
    const fehlend = d.anzahlGesamt - d.anzahlLager;

    const div=document.createElement("div");
    div.className="card";
    div.style.borderLeft=`10px solid ${imLager?"green":"red"}`;

    // Checkout Dropdown
    let outHTML = "<i>Kein Bestand im Lager</i>";
    if(d.anzahlLager > 0){
      outHTML = `
        <select id="out${d.id}">
          ${[...Array(d.anzahlLager)].map((_,i)=>`<option>${i+1}</option>`).join("")}
        </select>
        <button onclick="checkout(${d.id})">Auschecken</button>
      `;
    }

    // Checkin Dropdown
    let inHTML = "<i>Alles im Lager</i>";
    if(fehlend > 0){
      inHTML = `
        <select id="in${d.id}">
          ${[...Array(fehlend)].map((_,i)=>`<option>${i+1}</option>`).join("")}
        </select>
        <button onclick="checkin(${d.id})">Zurückbringen</button>
      `;
    }

    div.innerHTML=`
      <b>${d.name}</b><br>
      ${d.lager} | ${d.regal}<br>
      <b>${d.anzahlLager} / ${d.anzahlGesamt} im Lager</b><br><br>

      ${outHTML}<br><br>
      ${inHTML}<br><br>

      <button onclick="deleteDevice(${d.id})" style="background:red;color:white">Löschen</button>

      <div id="qr${d.id}"></div>
    `;

    if(imLager) lagerTab.appendChild(div);
    else draussenTab.appendChild(div);

    new QRCode(document.getElementById(`qr${d.id}`),{
      text:String(d.id),width:100,height:100
    });
  });
});


// Aktionen
function checkout(id){
  const menge = parseInt(document.getElementById("out"+id).value);
  db.ref("geraete/"+id).once("value").then(snap=>{
    const d=snap.val();
    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager - menge
    });
  });
}

function checkin(id){
  const menge = parseInt(document.getElementById("in"+id).value);
  db.ref("geraete/"+id).once("value").then(snap=>{
    const d=snap.val();
    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager + menge
    });
  });
}

function deleteDevice(id){
  if(confirm("Wirklich löschen?")){
    db.ref("geraete/"+id).remove();
  }
}
