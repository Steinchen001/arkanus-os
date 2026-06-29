const Tracker = {
  lastStage: null,

  update(distance, targetTitle = "Unbekannte Station"){
    distance = Math.round(distance);

    const stage = this.getStage(distance);
    const bars = "█".repeat(stage) + "░".repeat(10 - stage);

    this.updateScannerPanel(distance, targetTitle, stage, bars);

    if(stage === this.lastStage) return;
    this.lastStage = stage;

    if(typeof Radio !== "undefined"){
      Radio.show("SIGNALSCAN", this.getLines(distance, stage, bars));
    }
  },

  updateScannerPanel(distance, targetTitle, stage, bars){
    const barEl = document.getElementById("scanner-bars");
    const distanceEl = document.getElementById("scanner-distance");
    const statusEl = document.getElementById("scanner-status");

    if(!barEl || !distanceEl || !statusEl) return;

    barEl.innerText = bars;
    distanceEl.innerText = distance <= 8 ? "POSITION ERREICHT" : distance + " m";
    statusEl.innerText = "Ziel: " + targetTitle + " // Signalstufe " + stage + "/10";
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

  getLines(distance, stage, bars){
    if(stage === 10){
      return [bars, "", "Signal bestätigt.", "Position erreicht."];
    }

    if(stage >= 8){
      return [bars, "", "Fast am Ziel.", "Entfernung: " + distance + " Meter"];
    }

    if(stage >= 6){
      return [bars, "", "Signal sehr stabil.", "Entfernung: " + distance + " Meter"];
    }

    if(stage >= 4){
      return [bars, "", "Signal verbessert.", "Entfernung: " + distance + " Meter"];
    }

    return [bars, "", "Signal schwach.", "Entfernung: " + distance + " Meter"];
  }
};