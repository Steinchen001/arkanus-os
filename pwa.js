let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;

  const banner = document.getElementById("install-banner");

  if(banner && !localStorage.getItem("arkanus_install_banner_closed")){
    banner.classList.remove("hidden");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("install-btn");
  const closeBtn = document.getElementById("install-close");
  const banner = document.getElementById("install-banner");

  if(installBtn){
    installBtn.addEventListener("click", async () => {
      if(!deferredInstallPrompt) return;

      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;

      deferredInstallPrompt = null;

      if(banner){
        banner.classList.add("hidden");
      }
    });
  }

  if(closeBtn && banner){
    closeBtn.addEventListener("click", () => {
      banner.classList.add("hidden");
      localStorage.setItem("arkanus_install_banner_closed", "true");
    });
  }

  window.addEventListener("appinstalled", () => {
    if(banner){
      banner.classList.add("hidden");
    }

    localStorage.setItem("arkanus_app_installed", "true");
  });
});