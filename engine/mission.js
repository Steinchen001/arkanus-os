const Mission = {
  getActiveChapter(fall){
    if(!fall || !fall.chapters) return null;

    return fall.chapters.find(chapter => {
      const status = Storage.getChapterStatus(fall, chapter);
      return status !== "unlocked";
    }) || fall.chapters[fall.chapters.length - 1];
  },

  getStatusText(fall){
    const chapter = this.getActiveChapter(fall);

    if(!chapter){
      return "Keine aktive Mission";
    }

    const status = Storage.getChapterStatus(fall, chapter);

    if(status === "location_missing"){
      return "AKTIVE MISSION: " + chapter.title + " // Standort bestätigen";
    }

    if(status === "waiting"){
      return "AKTIVE MISSION: " + chapter.title + " // Wartet auf vorherige Sequenz";
    }

    if(status === "code_required"){
      return "AKTIVE MISSION: " + chapter.title + " // Feldcode erforderlich";
    }

    return "AKTIVE MISSION: " + chapter.title;
  }
};