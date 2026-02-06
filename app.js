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


// ➕ Gerät hinzufügen
function addDevice(){
  const name = document.getElementById("name").value;
  const lager = document.getElementById("lager").value;
  const regal = document.getElementById("regal").value;
  const anzahl = document.getElementById("anzahl").value;

  if(!name || !lager || !regal || !anzahl){
    alert("Alles ausfüllen!");
    return;
  }

  const id = Date.now(); // feste ID = fester QR Code

  db.ref("geraete/"+id).set({
    id,
    name,
    lager,
    regal,
    anzahl,
    imLager: true
  });

  document.querySelectorAll("input").forEach(i=>i.value="");
}


// 🔄 Realtime Anzeige
db.ref("geraete").on("value", snap=>{
  const data = snap.val() || {};
  list.innerHTML="";

  Object.values(data).forEach(d=>{
    const div=document.createElement("div");
    div.className="card";
    div.style.borderLeft=`10px solid ${d.imLager?"green":"red"}`;

    div.innerHTML=`
      <b>${d.name}</b><br>
      Lager: ${d.lager} | Regal: ${d.regal}<br>
      Stückzahl: ${d.anzahl}<br><br>

      <button onclick="toggleStatus(${d.id}, ${!d.imLager})">
        ${d.imLager?"Auschecken":"Zurück ins Lager"}
      </button>

      <button onclick="deleteDevice(${d.id})" style="background:red;color:white;">
        Gerät löschen
      </button>

      <div id="qr${d.id}" style="margin-top:10px;"></div>
    `;

    list.appendChild(div);

    // QR Code enthält NUR die ID -> bleibt immer gleich!
    new QRCode(document.getElementById(`qr${d.id}`),{
      text: String(d.id),
      width: 100,
      height: 100
    });
  });
});


// ✅ Status ändern
function toggleStatus(id,status){
  db.ref("geraete/"+id).update({imLager:status});
}


// 🗑 Gerät löschen mit Warnung
function deleteDevice(id){
  if(confirm("Willst du dieses Gerät wirklich löschen?")){
    db.ref("geraete/"+id).remove();
  }
}


// 📷 QR Scanner
function startScan(){
  const qr=new Html5Qrcode("reader");
  qr.start({facingMode:"environment"},{fps:10,qrbox:250}, msg=>{
    
    const id = msg; // nur ID aus QR Code

    db.ref("geraete/"+id).once("value").then(snap=>{
      const d = snap.val();
      if(d){
        scanResult.innerHTML=`
          <div style="border-left:10px solid ${d.imLager?"green":"red"};padding:10px;">
            <h3>${d.name}</h3>
            Lager: ${d.lager}<br>
            Regal: ${d.regal}<br>
            Stückzahl: ${d.anzahl}<br>
            Status: <b>${d.imLager?"Im Lager":"Nicht im Lager"}</b>
          </div>
        `;
      } else {
        scanResult.innerHTML="Gerät nicht gefunden!";
      }
    });

    qr.stop();
  });
}
