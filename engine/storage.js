const Storage = {
  prefix: "arkanus_",

  key(...parts){
    return this.prefix + parts.join("_");
  },

  set(key, value){
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  },

  get(key, fallback = null){
    const raw = localStorage.getItem(this.prefix + key);
    if(raw === null) return fallback;

    try{
      return JSON.parse(raw);
    }catch{
      return raw;
    }
  },

  remove(key){
    localStorage.removeItem(this.prefix + key);
  },

  setRaw(key, value){
    localStorage.setItem(this.prefix + key, value);
  },

  getRaw(key, fallback = null){
    return localStorage.getItem(this.prefix + key) || fallback;
  },

  unlock(fallId, chapterId){
    localStorage.setItem(this.key(fallId, chapterId), "true");
  },

  isUnlocked(fallId, chapterId){
    return localStorage.getItem(this.key(fallId, chapterId)) === "true";
  },
  setLocationReached(fallId, chapterId){
    localStorage.setItem(this.key(fallId, chapterId, "location"), "true");
  },

  isLocationReached(fallId, chapterId){
    return localStorage.getItem(this.key(fallId, chapterId, "location")) === "true";
  },
  markRead(fallId, chapterId){
    localStorage.setItem(this.key(fallId, chapterId, "read"), "true");
  },

  isRead(fallId, chapterId){
    return localStorage.getItem(this.key(fallId, chapterId, "read")) === "true";
  },

  saveLastFall(fallId){
    this.set("last_fall", fallId);
    this.set("last_visit", new Date().toISOString());
  },

  getLastFall(){
    return this.get("last_fall");
  },

  getLastVisit(){
    return this.get("last_visit");
  },

  saveLastChapter(chapterId){
    this.set("last_chapter", chapterId);
  },

  getLastChapter(){
    return this.get("last_chapter");
  },

  saveProfile(profile){
    this.set("profile", profile);
  },

  getProfile(){
    return this.get("profile");
  },

  clearProfile(){
    this.remove("profile");
  },

  log(text){
    const logs = this.get("log", []);
    logs.unshift({
      time: new Date().toISOString(),
      text
    });

    this.set("log", logs.slice(0, 50));
  },

  getLogs(limit = 30){
    return this.get("log", []).slice(0, limit);
  },

  countUnlocked(){
    let count = 0;

    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);

      if(
        key &&
        key.startsWith(this.prefix + "fall") &&
        localStorage.getItem(key) === "true"
      ){
        count++;
      }
    }

    return count;
  },

  getFallProgress(fallId, totalChapters){
    let unlocked = 0;

    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);

      if(
        key &&
        key.startsWith(this.prefix + fallId + "_") &&
        localStorage.getItem(key) === "true" &&
        !key.endsWith("_read")
      ){
        unlocked++;
      }
    }

    const percent = totalChapters > 0
      ? Math.min(100, Math.round((unlocked / totalChapters) * 100))
      : 0;

    return {
      unlocked,
      total: totalChapters,
      percent
    };
  }
};