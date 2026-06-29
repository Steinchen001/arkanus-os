const AudioServer = {
  active: false,

  intercept(audio, fall, chapter, onReady){
    if(this.active) return;

    this.active = true;
    audio.pause();

    if(typeof Radio !== "undefined"){
      Radio.show("AUDIO-SERVER", [
        "Verbindung wird aufgebaut...",
        "Ermittler bestätigt: " + Profile.getName(),
        "Archivdatei gefunden: " + chapter.title,
        "Signal stabil.",
        "Übertragung beginnt..."
      ]);
    }

    if(typeof Sounds !== "undefined"){
      Sounds.unlock();
    }

    setTimeout(() => {
      this.active = false;

      if(typeof onReady === "function"){
        onReady();
      }

      audio.play();
    }, 1800);
  }
};