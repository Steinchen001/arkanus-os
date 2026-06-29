const Director = {
  idleTimer: null,
  idleDelay: 60000,
  falseCodeCount: 0,

  init(){
    this.registerActivity();
    this.startIdleTimer();
    this.welcomeBack();
    this.nightMessage();
  },

  registerActivity(){
    ["click", "keydown", "touchstart"].forEach(eventName => {
      document.addEventListener(eventName, () => {
        this.startIdleTimer();
      }, { passive:true });
    });
  },

  startIdleTimer(){
    clearTimeout(this.idleTimer);

    this.idleTimer = setTimeout(() => {
      this.idleMessage();
    }, this.idleDelay);
  },

  idleMessage(){
    if(typeof Radio === "undefined") return;

    const messages = [
      ["Ermittler...", "Sind Sie noch da?"],
      ["Das Signal wird schwächer.", "Bleiben Sie in Verbindung."],
      ["Das Archiv wartet", "auf Ihre nächste Entscheidung."],
      ["Professor Arkanus", "wartete ebenfalls nicht."],
      ["Die Verbindung", "bleibt nicht ewig bestehen."],
      ["Keine Bewegung erkannt.", "Bitte setzen Sie die Ermittlung fort."],
      ["Die Spur bleibt aktiv.", "Noch."]
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];

    Radio.show("SYSTEMÜBERWACHUNG", msg);

    this.startIdleTimer();
  },

  welcomeBack(){
    const now = new Date();
    const last = Storage.get("director_last_seen");

    Storage.set("director_last_seen", now.toISOString());

    if(!last) return;

    const lastDate = new Date(last);
    const diffHours = Math.floor((now - lastDate) / 1000 / 60 / 60);

    if(diffHours >= 72 && typeof Radio !== "undefined"){
      setTimeout(() => {
        Radio.show("WILLKOMMEN ZURÜCK", [
          "Das Archiv blieb unangetastet.",
          "Letzter Zugriff vor " + diffHours + " Stunden.",
          "Verbindung erneut hergestellt."
        ]);
      }, 1800);
    }
  },

  nightMessage(){
    const hour = new Date().getHours();

    if(hour >= 22 || hour <= 4){
      const already = Storage.get("director_night_message");
      const today = new Date().toISOString().slice(0,10);

      if(already === today) return;

      Storage.set("director_night_message", today);

      if(typeof Radio !== "undefined"){
        setTimeout(() => {
          Radio.show("NACHTMODUS", [
            "Die Nacht eignet sich für Ermittlungen.",
            "Signalstörungen wurden reduziert.",
            "Bleiben Sie wachsam."
          ]);
        }, 2600);
      }
    }
  },

  codeFailed(){
    this.falseCodeCount++;

    if(this.falseCodeCount === 3 && typeof Radio !== "undefined"){
      Radio.show("HINWEIS", [
        "Archivschlüssel weiterhin ungültig.",
        "Prüfen Sie Schreibweise und Reihenfolge.",
        "Keine Leerzeichen erforderlich."
      ]);
    }

    if(this.falseCodeCount === 5 && typeof Radio !== "undefined"){
      Radio.show("SICHERHEITSWARNUNG", [
        "Ermittler...",
        "Sie probieren gerade einfach alles aus.",
        "Oder?"
      ]);
    }

    if(this.falseCodeCount === 8 && typeof Radio !== "undefined"){
      Radio.show("SYSTEMSPERRE VORBEREITET", [
        "Mehrere Fehlversuche registriert.",
        "Keine Sorge.",
        "Noch ist das System gnädig."
      ]);
    }
  },

  codeAccepted(){
    if(this.falseCodeCount >= 3 && typeof Radio !== "undefined"){
      Radio.show("ZUGRIFF WIEDERHERGESTELLT", [
        "Hartnäckigkeit zahlt sich aus.",
        "Archivschlüssel akzeptiert.",
        "Ermittlung wird fortgesetzt."
      ]);
    }

    this.falseCodeCount = 0;
  }
};