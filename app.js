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

// Tabs anzeigen
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
    id: id,
    name: name,
    lager: lager,
    regal: regal,
    anzahlGesamt: anzahl,
    anzahlLager: anzahl
  });

  // Input-Felder leeren
  document.getElementById("name").value = "";
  document.getElementById("lager").value = "";
  document.getElementById("regal").value = "";
  document.getElementById("anzahl").value = "";
}

// 🔄 Realtime Anzeige
db.ref("geraete").on("value", snap=>{
  const data = snap.val() || {};
  const lagerTab = document.getElementById("lagerTab");
  const draussenTab = document.getElementById("draussenTab");
  lagerTab.innerHTML = "";
  draussenTab.innerHTML = "";

  Object.values(data).forEach(d=>{
    const imLager = d.anzahlLager > 0;
    const fehlend = d.anzahlGesamt - d.anzahlLager;

    const div = document.createElement("div");
    div.className = "card";
    div.style.borderLeft = imLager ? "10px solid green" : "10px solid red";

    // Name + Lagerinfo
    const info = document.createElement("div");
    info.innerHTML = `<b>${d.name}</b><br>${d.lager} | ${d.regal}<br><b>${d.anzahlLager} / ${d.anzahlGesamt} im Lager</b>`;
    div.appendChild(info);

    // Checkout Dropdown
    const outContainer = document.createElement("div");
    if(d.anzahlLager > 0){
      const selectOut = document.createElement("select");
      selectOut.id = `out${d.id}`;
      for(let i=1; i<=d.anzahlLager; i++){
        const option = document.createElement("option");
        option.value = i; option.textContent = i;
        selectOut.appendChild(option);
      }
      const btnOut = document.createElement("button");
      btnOut.textContent = "Auschecken";
      btnOut.onclick = ()=>checkout(d.id);
      outContainer.appendChild(selectOut);
      outContainer.appendChild(btnOut);
    } else {
      outContainer.innerHTML = "<i>Kein Bestand im Lager</i>";
    }
    div.appendChild(document.createElement("br"));
    div.appendChild(outContainer);

    // Checkin Dropdown
    const inContainer = document.createElement("div");
    if(fehlend > 0){
      const selectIn = document.createElement("select");
      selectIn.id = `in${d.id}`;
      for(let i=1; i<=fehlend; i++){
        const option = document.createElement("option");
        option.value = i; option.textContent = i;
        selectIn.appendChild(option);
      }
      const btnIn = document.createElement("button");
      btnIn.textContent = "Zurückbringen";
      btnIn.onclick = ()=>checkin(d.id);
      inContainer.appendChild(selectIn);
      inContainer.appendChild(btnIn);
    } else {
      inContainer.innerHTML = "<i>Alles im Lager</i>";
    }
    div.appendChild(document.createElement("br"));
    div.appendChild(inContainer);

    // Löschen Button
    const btnDel = document.createElement("button");
    btnDel.textContent = "Löschen";
    btnDel.style.backgroundColor = "red";
    btnDel.style.color = "white";
    btnDel.onclick = ()=>deleteDevice(d.id);
    div.appendChild(document.createElement("br"));
    div.appendChild(btnDel);

    // QR-Code
    const qrDiv = document.createElement("div");
    qrDiv.id = `qr${d.id}`;
    div.appendChild(qrDiv);
    new QRCode(qrDiv, {text:String(d.id), width:100, height:100});

    if(imLager) lagerTab.appendChild(div);
    else draussenTab.appendChild(div);
  });
});

// ➖ Checkout
function checkout(id){
  const menge = parseInt(document.getElementById("out"+id).value);
  db.ref("geraete/"+id).once("value").then(snap=>{
    const d = snap.val();
    db.ref("geraete/"+id).update({anzahlLager: d.anzahlLager - menge});
  });
}

// ➕ Checkin
function checkin(id){
  const menge = parseInt(document.getElementById("in"+id).value);
  db.ref("geraete/"+id).once("value").then(snap=>{
    const d = snap.val();
    db.ref("geraete/"+id).update({anzahlLager: d.anzahlLager + menge});
  });
}

// 🗑 Löschen
function deleteDevice(id){
  if(confirm("Wirklich löschen?")){
    db.ref("geraete/"+id).remove();
  }
}
