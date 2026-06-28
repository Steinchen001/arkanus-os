const UpdateSystem = {
  init(){
    if(!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if(sessionStorage.getItem("arkanus_reloading")) return;

      sessionStorage.setItem("arkanus_reloading", "true");
      window.location.reload();
    });
  }
};

UpdateSystem.init();