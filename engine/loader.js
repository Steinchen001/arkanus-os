const Loader = {
  cases: [],
  settings: {},
  ranks: [],
  achievements: [],

  async init(){
    this.cases = await this.loadJson("data/cases.json", []);
    this.settings = await this.loadJson("data/settings.json", {});
    this.ranks = await this.loadJson("data/ranks.json", []);
    this.achievements = await this.loadJson("data/achievements.json", []);
  },

  async loadJson(path, fallback){
    try{
      const response = await fetch(path + "?v=" + Date.now());

      if(!response.ok){
        throw new Error("Datei nicht gefunden: " + path);
      }

      return await response.json();
    }catch(error){
      console.error(error);
      return fallback;
    }
  },

  getCases(){
    return this.cases;
  },

  async loadCase(caseItem){
    const path = caseItem.folder + "/case.json";
    return await this.loadJson(path, null);
  }
};