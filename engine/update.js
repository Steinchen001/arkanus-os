const UpdateSystem = {
  init(){
    if(!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if(sessionStorage.getItem("arkanus_reloading")) return;

      sessionStorage.setItem("arkanus_reloading", "true");
      window.location.reload();
    });

    navigator.serviceWorker.getRegistration().then(registration => {
      if(!registration) return;

      registration.update();
    });
  },

  async clearCachesKeepProfile(){
    if("caches" in window){
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }

    sessionStorage.removeItem("arkanus_reloading");

    alert("Cache gelöscht. Profil bleibt erhalten. Seite wird neu geladen.");
    window.location.reload();
  }
};

UpdateSystem.init();