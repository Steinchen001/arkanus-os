document.addEventListener("DOMContentLoaded", () => {
  const version = document.getElementById("app-version");

  if(version && typeof Version !== "undefined"){
    version.innerText = "ARKANUS ENGINE // " + Version.getLabel();
  }
});