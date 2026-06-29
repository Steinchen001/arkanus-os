const Radio = {
  show(title, lines = []){
    let overlay = document.getElementById("radio-overlay");

    if(!overlay){
      overlay = document.createElement("div");
      overlay.id = "radio-overlay";
      overlay.innerHTML = `
        <div class="radio-box">
          <div class="radio-title">ARKANUS ZENTRALE</div>
          <h2></h2>
          <div class="radio-lines"></div>
<div class="radio-hint">BERÜHREN ZUM BESTÄTIGEN</div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.querySelector("h2").innerText = title;
    overlay.querySelector(".radio-lines").innerHTML =
      lines.map(line => `<p>&gt; ${line}</p>`).join("");

    overlay.classList.add("active");

    if(typeof Sounds !== "undefined"){
      Sounds.mission();
    }

    overlay.onclick = () => {
  overlay.classList.remove("active");
};
  },

  mission(text){
    this.show("NEUE ANWEISUNG", [
      "Ermittler bestätigt: " + Profile.getName(),
      "Übertragung empfangen",
      text
    ]);
  },

  denied(){
    this.show("ZUGRIFF VERWEIGERT", [
      "Authentifizierung fehlgeschlagen",
      "Archivschlüssel ungültig",
      "Versuch wurde protokolliert"
    ]);
  },

  gps(text){
    this.show("GPS SIGNAL", [
      "Koordinaten erkannt",
      "Station lokalisiert",
      text
    ]);
  }
};