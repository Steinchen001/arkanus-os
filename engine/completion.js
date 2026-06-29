const Completion = {
  isFallCompleted(fall){
    if(!fall || !fall.chapters) return false;

    return fall.chapters.every(chapter =>
      Storage.canAccessChapter(fall, chapter)
    );
  },

  show(fall){
  if(!fall || !this.isFallCompleted(fall)) return;

  if(Storage.get("completed_" + fall.id) === true){
    return;
  }

  Storage.set("completed_" + fall.id, true);

  if(typeof Sounds !== "undefined"){
    Sounds.reward();
  }

  if(typeof Notify !== "undefined"){
    Notify.success("Akte abgeschlossen: " + fall.title);
  }

  Feedback.notify("AKTE ABGESCHLOSSEN", [
    fall.internalId + " // " + fall.title,
    "Alle Sequenzen freigegeben",
    "Ermittlungsakte vollständig synchronisiert",
    "Auszeichnung erhalten: " + fall.internalId
  ]);

  Storage.log("Akte abgeschlossen: " + fall.title);
}
};