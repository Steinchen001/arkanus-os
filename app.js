document.addEventListener("DOMContentLoaded", () => {
  if(typeof Arkanus !== "undefined"){
    Arkanus.init();
  }else{
    console.error("ARKANUS Engine nicht gefunden.");
  }
});