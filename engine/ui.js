const UI = {
  titles: {
    cases: "ARCHIV",
    audio: "AUDIOPROTOKOLLE",
    map: "ERMITTLERKARTE",
    documents: "ERMITTLERAKTE",
    classified: "KLASSIFIZIERT"
  },

  init(){
    this.views = document.querySelectorAll(".view");
    this.navButtons = document.querySelectorAll(".nav-btn");
    this.windowTitle = document.getElementById("window-title");

    this.navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.showView(btn.dataset.view);
      });
    });
  },

  showView(viewName){
    this.views.forEach(view => view.classList.remove("active-view"));

    const selected = document.getElementById(viewName);

    if(selected){
      selected.classList.add("active-view");
    }

    this.navButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    if(this.windowTitle){
      this.windowTitle.innerText = this.titles[viewName] || "ARKANUS OS";
    }

    if(viewName === "map"){
      setTimeout(() => {
        if(typeof MapSystem !== "undefined" && MapSystem.map){
          MapSystem.map.invalidateSize();
        }
      }, 300);
    }
  }
};