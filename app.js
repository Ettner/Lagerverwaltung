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
  lagerTab.innerHTML="";
  draussenTab.innerHTML="";

  Object.values(data).forEach(d=>{
    const imLager = d.anzahlLager > 0;

    const div=document.createElement("div");
    div.className="card";
    div.style.borderLeft=`10px solid ${imLager?"green":"red"}`;

    div.innerHTML=`
      <b>${d.name}</b><br>
      Lager: ${d.lager} | Regal: ${d.regal}<br>
      <b>Im Lager: ${d.anzahlLager} / ${d.anzahlGesamt}</b><br><br>

      ${d.anzahlLager > 0 ? `
<select id="out${d.id}">
  ${[...Array(d.anzahlLager).keys()].map(i =>
    `<option value="${i+1}">${i+1}</option>`
  ).join('')}
</select>
<button onclick="checkout(${d.id})">Auschecken</button>
` : `<i>Kein Bestand im Lager</i>`}

      <input type="number" id="in${d.id}" placeholder="Menge zurückbringen">
      <button onclick="checkin(${d.id})">Zurückbringen</button>

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


// ➖ Auschecken (Teilmenge)
function checkout(id){
  const menge = parseInt(document.getElementById("out"+id).value);

  db.ref("geraete/"+id).once("value").then(snap=>{
    const d = snap.val();

    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager - menge
    });
  });
}

    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager - menge
    });
  });
}


// ➕ Zurückbringen
function checkin(id){
  const menge = parseInt(document.getElementById("in"+id).value);

  if(!menge || menge <= 0){
    alert("Gültige Menge eingeben!");
    return;
  }

  db.ref("geraete/"+id).once("value").then(snap=>{
    const d = snap.val();

    if(d.anzahlLager + menge > d.anzahlGesamt){
      alert("Mehr als Gesamtbestand!");
      return;
    }

    db.ref("geraete/"+id).update({
      anzahlLager: d.anzahlLager + menge
    });
  });
}


// 🗑 Löschen mit Warnung
function deleteDevice(id){
  if(confirm("Gerät wirklich löschen?")){
    db.ref("geraete/"+id).remove();
  }
}


// 📷 QR Scan zeigt Live-Daten
function startScan(){
  const qr=new Html5Qrcode("reader");
  qr.start({facingMode:"environment"},{fps:10,qrbox:250}, msg=>{
    
    const id = msg;

    db.ref("geraete/"+id).once("value").then(snap=>{
      const d = snap.val();
      const imLager = d.anzahlLager > 0;

      scanResult.innerHTML=`
        <div style="border-left:10px solid ${imLager?"green":"red"};padding:10px;">
          <h3>${d.name}</h3>
          Lager: ${d.lager}<br>
          Regal: ${d.regal}<br>
          Bestand: ${d.anzahlLager} / ${d.anzahlGesamt}
        </div>
      `;
    });

    qr.stop();
  });
}
