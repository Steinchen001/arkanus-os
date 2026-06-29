const Progress = {
  getFallProgress(fall){
    if(!fall || !fall.chapters){
      return {
        unlocked: 0,
        total: 0,
        percent: 0
      };
    }

    const total = fall.chapters.length;

    const unlocked = fall.chapters.filter(chapter =>
      Storage.canAccessChapter(fall, chapter)
    ).length;

    const percent = total > 0
      ? Math.min(100, Math.round((unlocked / total) * 100))
      : 0;

    return {
      unlocked,
      total,
      percent
    };
  },
    flashBars(){
    document.querySelectorAll(".progress-bar").forEach(bar => {
      bar.classList.remove("flash");
      void bar.offsetWidth;
      bar.classList.add("flash");
    });
  }
};