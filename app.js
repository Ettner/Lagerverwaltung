let devices = JSON.parse(localStorage.getItem("devices")) || [];

function save() {
    localStorage.setItem("devices", JSON.stringify(devices));
}

function render() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    devices.forEach((d, i) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <b>${d.name}</b><br>
            Lager: ${d.lager} | Regal: ${d.regal}
            <div id="qr-${d.id}" class="qr"></div>
            <button onclick="removeDevice(${i})">Löschen</button>
        `;
        list.appendChild(div);

        new QRCode(document.getElementById(`qr-${d.id}`), {
            text: JSON.stringify(d),
            width: 120,
            height: 120
        });
    });
}

function addDevice() {
    const name = document.getElementById("name").value;
    const lager = document.getElementById("lager").value;
    const regal = document.getElementById("regal").value;

    if (!name || !lager || !regal) {
        alert("Bitte alles ausfüllen");
        return;
    }

    devices.push({
        id: Date.now(),
        name, lager, regal
    });

    save();
    render();

    name.value = lager.value = regal.value = "";
}

function removeDevice(i) {
    devices.splice(i, 1);
    save();
    render();
}

function startScan() {
    const qr = new Html5Qrcode("reader");
    qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (msg) => {
            const d = JSON.parse(msg);
            document.getElementById("scanResult").innerHTML =
                `<h3>${d.name}</h3>Lager: ${d.lager}<br>Regal: ${d.regal}`;
            qr.stop();
        }
    );
}

render();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}