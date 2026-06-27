const Profile = {
  current: null,

  load(){
    this.current = Storage.get("profile");
    return this.current;
  },

  exists(){
    return this.load() !== null;
  },

  create(name){
    const cleanName = name.trim();

    const profile = {
      name: cleanName,
      serviceNumber: this.generateServiceNumber(),
      createdAt: new Date().toISOString()
    };

    Storage.saveProfile(profile);
    Storage.log("Ermittlerprofil erstellt: " + profile.name);

    this.current = profile;
    return profile;
  },

  generateServiceNumber(){
    const number = Math.floor(100000 + Math.random() * 900000);
    return "ARK-" + number;
  },

  getName(){
    return this.current ? this.current.name : "BESUCHER";
  },

  getServiceNumber(){
    return this.current && this.current.serviceNumber
      ? this.current.serviceNumber
      : "ARK-000000";
  },

  getClearance(){
    const unlocked = Storage.countUnlocked();

    if(unlocked >= 20) return "DIRECTOR CLEARANCE";
    if(unlocked >= 12) return "ARCHIVIST";
    if(unlocked >= 7) return "SENIOR INVESTIGATOR";
    if(unlocked >= 4) return "FIELD INVESTIGATOR";
    if(unlocked >= 1) return "OBSERVER";

    return "VISITOR";
  },

  getLevel(){
    const unlocked = Storage.countUnlocked();

    if(unlocked >= 20) return 6;
    if(unlocked >= 12) return 5;
    if(unlocked >= 7) return 4;
    if(unlocked >= 4) return 3;
    if(unlocked >= 1) return 2;

    return 1;
  },

  getTrustPercent(){
    const unlocked = Storage.countUnlocked();
    return Math.min(100, Math.round((unlocked / 20) * 100));
  },

  getCreatedDate(){
    if(!this.current || !this.current.createdAt) return "Unbekannt";

    return new Date(this.current.createdAt).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  },

  updateBadge(){
    const badge = document.querySelector(".access-badge");
    if(!badge) return;

    badge.innerHTML = `
      ERMITTLER: ${this.getName()}<br>
      <span style="color:#00ffd0">${this.getClearance()}</span>
    `;
  },

  showSetup(onDone){
    let overlay = document.getElementById("profile-overlay");

    if(!overlay){
      overlay = document.createElement("div");
      overlay.id = "profile-overlay";
      overlay.innerHTML = `
        <div class="profile-box">
          <div class="profile-title">ARKANUS PROFIL</div>
          <p>Unbekanntes Gerät erkannt.</p>
          <p>Bitte registriere einen Ermittlernamen für dieses Gerät.</p>

          <input id="investigator-name" placeholder="Ermittlername">

          <button id="save-investigator" class="primary-btn">
            Profil erstellen
          </button>

          <div id="profile-message" class="message"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.classList.add("active");

    document.getElementById("save-investigator").onclick = () => {
      const input = document.getElementById("investigator-name");
      const msg = document.getElementById("profile-message");
      const name = input.value.trim();

      if(name.length < Config.profile.minNameLength){
        msg.innerText = "Name zu kurz.";
        return;
      }

      this.create(name);

      msg.innerText = "Profil erstellt. Dienstnummer zugewiesen.";

      setTimeout(() => {
        overlay.classList.remove("active");
        this.updateBadge();

        if(typeof onDone === "function"){
          onDone();
        }
      }, 900);
    };
  },

  showEdit(){
    let overlay = document.getElementById("profile-edit-overlay");

    if(!overlay){
      overlay = document.createElement("div");
      overlay.id = "profile-edit-overlay";
      overlay.innerHTML = `
        <div class="profile-box">
          <div class="profile-title">PROFIL BEARBEITEN</div>
          <p>Ändere deinen Ermittlernamen auf diesem Gerät.</p>

          <input id="edit-investigator-name" placeholder="Ermittlername">

          <button id="update-investigator" class="primary-btn">
            Namen speichern
          </button>

          <button id="close-profile-edit" class="primary-btn secondary-btn">
            Abbrechen
          </button>

          <div id="profile-edit-message" class="message"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    document.getElementById("edit-investigator-name").value = this.getName();
    overlay.classList.add("active");

    document.getElementById("close-profile-edit").onclick = () => {
      overlay.classList.remove("active");
    };

    document.getElementById("update-investigator").onclick = () => {
      const input = document.getElementById("edit-investigator-name");
      const msg = document.getElementById("profile-edit-message");
      const name = input.value.trim();

      if(name.length < Config.profile.minNameLength){
        msg.innerText = "Name zu kurz.";
        return;
      }

      this.current.name = name;
      Storage.saveProfile(this.current);
      Storage.log("Ermittlername geändert: " + name);

      msg.innerText = "Name gespeichert.";
      this.updateBadge();

      if(typeof Archive !== "undefined"){
        Archive.renderDocuments();
      }

      setTimeout(() => {
        overlay.classList.remove("active");
      }, 700);
    };
  }
};