const Mission = {
  lastRadioText: null,

  getActiveChapter(fall){
    if(!fall || !fall.chapters) return null;

    for(const chapter of fall.chapters){
      const status = Storage.getChapterStatus(fall, chapter);

      if(status === "unlocked" && chapter.audio && !Storage.isAudioStarted(fall.id, chapter.id)){
        return chapter;
      }

      if(status !== "unlocked"){
        return chapter;
      }
    }

    return fall.chapters[fall.chapters.length - 1];
  },

  getStatusText(fall){
    const chapter = this.getActiveChapter(fall);

    if(!chapter){
      return "Keine aktive Mission";
    }

    const status = Storage.getChapterStatus(fall, chapter);
    const audioStarted = Storage.isAudioStarted(fall.id, chapter.id);

    if(chapter.audio && !audioStarted && status === "unlocked"){
      return "🎧 Audioprotokoll anhören: " + chapter.title;
    }

    if(status === "location_missing"){
      return "📍 Begib dich zur Station: " + chapter.title;
    }

    if(status === "waiting"){
      return "▶ Audioprotokoll auswerten: " + chapter.title;
    }

    if(status === "code_required"){
      return "🔑 Feldcode erforderlich: " + chapter.title;
    }

    if(status === "unlocked"){
      return "✅ Sequenz freigegeben: " + chapter.title;
    }

    return "🛰 Neue Anweisung wird berechnet";
  },

  updateHud(fall){
    const hud = document.getElementById("mission-hud");
    const title = document.getElementById("mission-hud-title");

    if(!hud || !title) return;

    if(!fall){
      hud.classList.add("hidden");
      return;
    }

    const newText = this.getStatusText(fall);

    if(title.innerText !== newText){
      hud.classList.remove("flash");
      void hud.offsetWidth;
      hud.classList.add("flash");

      if(typeof Sounds !== "undefined"){
        Sounds.mission();
      }

      if(typeof Notify !== "undefined"){
        Notify.mission("Neue Anweisung empfangen");
      }

      if(typeof Radio !== "undefined" && this.lastRadioText !== newText){
        this.lastRadioText = newText;
        Radio.mission(newText);
      }
    }

    title.innerText = newText;
    hud.classList.remove("hidden");
  }
};