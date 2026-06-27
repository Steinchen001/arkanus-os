const Progress = {
  getFallProgress(fall){
    if(!fall || !fall.chapters){
      return {
        unlocked: 0,
        total: 0,
        percent: 0
      };
    }

    let total = fall.chapters.length;
    let unlocked = 0;

    fall.chapters.forEach(chapter => {
      if(!chapter.code || Storage.isUnlocked(fall.id, chapter.id)){
        unlocked++;
      }
    });

    const percent = total > 0
      ? Math.min(100, Math.round((unlocked / total) * 100))
      : 0;

    return {
      unlocked,
      total,
      percent
    };
  }
};