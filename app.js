document.addEventListener("DOMContentLoaded", () => {
  const version = document.getElementById("app-version");

  if(version && typeof Version !== "undefined"){
    version.innerText = "ARKANUS ENGINE // " + Version.getLabel();
  }

  if(typeof Arkanus !== "undefined"){
    Arkanus.init();
  }else{
    console.error("ARKANUS Engine nicht gefunden.");
  }
});