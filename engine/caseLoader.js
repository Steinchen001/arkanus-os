const CaseLoader = {
  async load(caseItem){
    if(!caseItem || !caseItem.folder){
      throw new Error("Keine gültige Akte übergeben.");
    }

    const path = caseItem.folder + "/case.json";
    const data = await Loader.loadJson(path, null);

    if(!data){
      throw new Error("Akte konnte nicht geladen werden: " + path);
    }

    return data;
  }
};