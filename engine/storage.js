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

  canAccessChapter(fall, chapter){
    if(!fall || !chapter) return false;

    if(!chapter.code && !chapter.unlockAfterInteraction){
      return true;
    }

    if(this.isUnlocked(fall.id, chapter.id)){
      return true;
    }

    return false;
  },

  canEnterCode(fall, chapter){
    if(!fall || !chapter || !chapter.code) return false;

    const requiresLocation =
      chapter.map &&
      chapter.map.requiresLocation === true;

    if(requiresLocation && !this.isLocationReached(fall.id, chapter.id)){
      return false;
    }

    return true;
  },

  getChapterStatus(fall, chapter){
    if(this.canAccessChapter(fall, chapter)){
      return "unlocked";
    }

    if(chapter.unlockAfterInteraction){
      return "waiting";
    }

    const requiresLocation =
      chapter.map &&
      chapter.map.requiresLocation === true;

    if(requiresLocation && !this.isLocationReached(fall.id, chapter.id)){
      return "location_missing";
    }

    if(chapter.code){
      return "code_required";
    }

    return "locked";
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
        key.startsWith(this.prefix + "akte") &&
        localStorage.getItem(key) === "true" &&
        !key.endsWith("_read") &&
        !key.endsWith("_location")
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
        !key.endsWith("_read") &&
        !key.endsWith("_location")
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