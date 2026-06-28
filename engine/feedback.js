const Feedback = {
  vibrate(pattern = 80){
    if("vibrate" in navigator){
      navigator.vibrate(pattern);
    }
  },

  notify(title, lines = []){
    Decrypt.show(title, lines);
    this.vibrate([80, 40, 80]);

    setTimeout(() => {
      Decrypt.hide();
    }, 2200);
  },

  success(text){
    this.notify("ARKANUS SYSTEM", [
      text,
      "Status: erfolgreich",
      "Archiv synchronisiert"
    ]);
  },

  warning(text){
    this.notify("WARNUNG", [
      text,
      "Weitere Prüfung erforderlich"
    ]);
  }
};