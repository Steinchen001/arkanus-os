const Arkanus = {
  bootScreen: null,
  app: null,
  bootText: null,

  async init(){
    this.bootScreen = document.getElementById("boot-screen");
    this.app = document.getElementById("app");
    this.bootText = document.getElementById("boot-text");

    await Loader.init();

    Profile.load();
    UI.init();
    Player.init();
    Archive.init();
    Dev.init();

    this.boot();
  },

  boot(){
    const profile = Profile.current;
    const lastFall = Storage.getLastFall();

    const version =
      typeof Version !== "undefined"
        ? Version.getLabel()
        : "Version unbekannt";

    const lines = [
      "> ARKANUS OS wird gestartet …",
      "> Sichere Verbindung hergestellt",
      "> Domain: arkanus.ch",
      "> PWA-Modus aktiviert",
      "> Offline-Cache geprüft",
      "> " + version,
      "> Akten geladen: " + Loader.getCases().length,
      profile ? "> Ermittlerprofil erkannt: " + profile.name : "> Kein Ermittlerprofil gefunden",
      lastFall ? "> Letzte Akte: " + lastFall : "> Keine letzte Akte gefunden",
      "> Zugriffsstufe: BESUCHER",
      "> System bereit █"
    ];

    let line = 0;
    let char = 0;

    const typeLine = () => {
      if(line >= lines.length){
        setTimeout(() => {
          this.bootScreen.classList.add("hidden");
          this.app.classList.remove("hidden");

          if(!Profile.current){
            Profile.showSetup(() => {
              this.afterBoot();
            });
            return;
          }

          this.afterBoot();
        }, 700);

        return;
      }

      if(char < lines[line].length){
        this.bootText.innerHTML += lines[line].charAt(char);
        char++;
        setTimeout(typeLine, 20);
      }else{
        this.bootText.innerHTML += "<br>";
        line++;
        char = 0;
        setTimeout(typeLine, 150);
      }
    };

    typeLine();
  },

  afterBoot(){
    Profile.updateBadge();

    const version = document.getElementById("app-version");
    if(version && typeof Version !== "undefined"){
      version.innerText = "ARKANUS ENGINE // " + Version.getLabel();
    }

    Archive.renderCases();
    Archive.renderDocuments();
    Archive.openFromUrl();
    if(typeof Sounds !== "undefined"){
  Sounds.loadSetting();

  const soundBtn = document.getElementById("sound-toggle-btn");

  if(soundBtn){
    soundBtn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();

      Sounds.toggle();

      if(typeof Notify !== "undefined"){
        Notify.system(
          Sounds.enabled
            ? "Systemsound aktiviert"
            : "Systemsound deaktiviert"
        );
      }
    });
  }
}

    setTimeout(() => {
      Profile.updateBadge();
    }, 500);

    document.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        if(typeof Sounds !== "undefined"){
          Sounds.click();
        }
      });
    });
  }
};