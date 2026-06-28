const Stats = {
  getProfileStats(){
    const logs = Storage.getLogs(999);
    const unlocked = Storage.countUnlocked();

    return {
      xp: this.getXP(),
      level: this.getLevel(),
      rank: this.getRank(),
      unlocked,
      logs: logs.length,
      achievements: this.getAchievements().length
    };
  },

  getXP(){
    let xp = 0;

    xp += Storage.countUnlocked() * 100;
    xp += Storage.getLogs(999).length * 5;

    return xp;
  },

  getLevel(){
    return Math.max(1, Math.floor(this.getXP() / 250) + 1);
  },

  getRank(){
    const level = this.getLevel();

    if(level >= 10) return "ARKANUS-DIREKTOR";
    if(level >= 8) return "SONDERERMITTLER";
    if(level >= 6) return "KOMMISSAR";
    if(level >= 4) return "SPEZIALIST";
    if(level >= 2) return "ERMITTLER";

    return "REKRUT";
  },

  getAchievements(){
    const achievements = [];

    if(Storage.countUnlocked() >= 1){
      achievements.push("Erste Spur entschlüsselt");
    }

    if(Storage.countUnlocked() >= 5){
      achievements.push("Mehrere Protokolle freigegeben");
    }

    if(Storage.getLogs(999).length >= 20){
      achievements.push("Aktiver Ermittler");
    }

    return achievements;
  }
};