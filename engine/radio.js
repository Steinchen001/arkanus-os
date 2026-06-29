const Radio = {
  active: false,

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

    overlay.querySelector(".radio-title").innerText = "ARKANUS ZENTRALE";
    overlay.querySelector("h2").innerText = title;
    overlay.querySelector(".radio-lines").innerHTML =
      lines.map(line => `<p>&gt; ${line}</p>`).join("");

    overlay.classList.add("active");
    this.active = true;

    if(typeof Sounds !== "undefined"){
      Sounds.mission();
    }

    overlay.onclick = () => {
      overlay.classList.remove("active");
      this.active = false;
    };
  },

  mission(text){
  const extra =
    text.includes("Audioprotokoll") || text.includes("auswerten")
      ? "Öffnen Sie das Audioprotokoll und hören Sie die Übertragung vollständig an."
      : "Folgen Sie der aktiven Mission im System.";

  this.show("NEUE ANWEISUNG", [
    "Ermittler bestätigt: " + Profile.getName(),
    "Übertragung empfangen",
    text,
    extra
  ]);
},

  denied(){
    this.show("SICHERHEITSALARM", [
      "Authentifizierung fehlgeschlagen",
      "Archivschlüssel ungültig",
      "Versuch wurde protokolliert"
    ]);
  },

  gps(text){
    this.show("SATELLITENVERBINDUNG", [
      "Koordinaten erkannt",
      "Station lokalisiert",
      text
    ]);
  },

  welcome(){
    const name = Profile.getName();

    this.show("VERBINDUNG HERGESTELLT", [
      "Willkommen zurück, " + name + ".",
      "Identität bestätigt",
      "Archivzugriff wird vorbereitet"
    ]);
  },

  chapter(chapter){
    if(!chapter) return;

    const special = this.getChapterMessage(chapter);

    if(special){
      this.show(special.title, special.lines);
    }
  },

  getChapterMessage(chapter){
    const id = chapter.id;

    if(id === "audio01" || id === "prolog"){
      return {
        title: "ERSTE ÜBERTRAGUNG",
        lines: [
          "Willkommen Ermittler.",
          "Die erste Spur wurde aktiviert.",
          "Achten Sie auf jedes Detail."
        ]
      };
    }

    if(id === "audio02" || id === "brief"){
      return {
        title: "ARCHIVHINWEIS",
        lines: [
          "Eine Nachricht wurde entschlüsselt.",
          "Professor Arkanus hat Spuren hinterlassen.",
          "Folgen Sie der Kette."
        ]
      };
    }

    if(id === "audio05" || id === "pforten"){
      return {
        title: "PRIORITÄTSMELDUNG",
        lines: [
          "Die fünf Pforten sind kein Zufall.",
          "Das System erkennt ein Muster.",
          "Die Maschine reagiert."
        ]
      };
    }

    if(id === "audio08" || id === "letztes-protokoll"){
      return {
        title: "PRIORITÄT ALPHA",
        lines: [
          "Ab hier existieren keine Aufzeichnungen mehr.",
          "Sie sind auf sich allein gestellt.",
          "Viel Glück."
        ]
      };
    }

    if(id === "audio09" || id === "epilog"){
      return {
        title: "VERBINDUNG UNTERBROCHEN",
        lines: [
          "...",
          "Neue Verbindung erkannt",
          "Carlos Arkanus",
          "Danke."
        ]
      };
    }

    return null;
  }
};