const Tracker = {
  lastStage: null,
  scannerActive: false,

  update(distance){
    if(typeof Radio === "undefined") return;

    distance = Math.round(distance);

    const stage = this.getStage(distance);

    if(stage === this.lastStage) return;

    this.lastStage = stage;

    const lines = this.getLines(distance, stage);

    const overlay = document.getElementById("radio-overlay");
    const isOpen = overlay && overlay.classList.contains("active");

    if(isOpen && this.scannerActive){
      overlay.querySelector("h2").innerText = "SIGNALSCAN";
      overlay.querySelector(".radio-lines").innerHTML =
        lines.map(line => `<p>&gt; ${line}</p>`).join("");
      return;
    }

    this.scannerActive = true;

    Radio.show("SIGNALSCAN", lines);

    if(overlay){
      overlay.addEventListener("click", () => {
        this.scannerActive = false;
      }, { once:true });
    }
  },

  getStage(distance){
    if(distance <= 8) return 10;
    if(distance <= 15) return 9;
    if(distance <= 25) return 8;
    if(distance <= 40) return 7;
    if(distance <= 60) return 6;
    if(distance <= 90) return 5;
    if(distance <= 130) return 4;
    if(distance <= 180) return 3;
    if(distance <= 250) return 2;
    return 1;
  },

  getLines(distance, stage){
    const bars = "█".repeat(stage) + "░".repeat(10 - stage);

    if(stage === 10){
      return [
        bars,
        "",
        "Signal bestätigt.",
        "Position erreicht.",
        "Ermittlung kann fortgesetzt werden."
      ];
    }

    if(stage >= 8){
      return [
        bars,
        "",
        "Fast am Ziel.",
        "Entfernung: " + distance + " Meter"
      ];
    }

    if(stage >= 6){
      return [
        bars,
        "",
        "Signal sehr stabil.",
        "Entfernung: " + distance + " Meter"
      ];
    }

    if(stage >= 4){
      return [
        bars,
        "",
        "Signal verbessert.",
        "Entfernung: " + distance + " Meter"
      ];
    }

    return [
      bars,
      "",
      "Signal schwach.",
      "Entfernung: " + distance + " Meter"
    ];
  }
};