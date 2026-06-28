const Dev = {
  enabled: false,

  init(){
    const params = new URLSearchParams(window.location.search);
    this.enabled = params.get("dev") === "1";

    if(!this.enabled) return;

    this.addDevButton();
  },

  addDevButton(){
    const btn = document.createElement("button");
    btn.id = "dev-button";
    btn.innerText = "🛠 DEV";
    btn.onclick = () => this.open();
    document.body.appendChild(btn);
  },

  async open(){
    let overlay = document.getElementById("dev-overlay");

    if(!overlay){
      overlay = document.createElement("div");
      overlay.id = "dev-overlay";
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="dev-box">
        <button class="dev-close" onclick="Dev.close()">×</button>
        <h2>ARKANUS DEV CONSOLE</h2>
        <p class="meta">Nur für Ersteller sichtbar // ?dev=1</p>

        <div class="dev-actions">
          <button class="primary-btn" onclick="Dev.resetCurrentCase()">
            🧨 Aktive Akte zurücksetzen
          </button>

          <button class="primary-btn" onclick="Dev.resetLocalProgress()">
            💾 Gesamten lokalen Speicher löschen
          </button>
        </div>

        <div id="dev-content">
          <p>Lade Akten...</p>
        </div>
      </div>
    `;

    overlay.classList.add("active");

    const content = document.getElementById("dev-content");
    const cases = Loader.getCases();

    let html = "";

    for(const item of cases){
      html += await this.renderCase(item);
    }

    content.innerHTML = html;
  },

  async renderCase(item){
    let detail = null;

    try{
      detail = await CaseLoader.load(item);
    }catch(e){
      detail = null;
    }

    return `
      <div class="dev-case">
        <h3>AKTE ${item.number} // ${item.title}</h3>

        <p><strong>ID:</strong> ${item.id}</p>
        <p><strong>Interne Kennung:</strong> ${item.internalId || "-"}</p>
        <p><strong>GC-Code:</strong> ${item.gcCode || "folgt"}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Ordner:</strong> ${item.folder}</p>

        <button class="primary-btn" onclick="Dev.openCase('${item.id}')">
          Akte öffnen
        </button>

        ${detail && detail.chapters ? `
          <h4>Feldcodes</h4>
          <ul class="dev-code-list">
            ${detail.chapters.map(chapter => `
              <li>
                <span>${chapter.title}</span>
                <code>${chapter.code || "FREI"}</code>
                ${chapter.code ? `
                  <button onclick="Dev.copyCode('${chapter.code}')">Kopieren</button>
                ` : ""}
              </li>
            `).join("")}
          </ul>
        ` : `
          <p class="dev-warning">Keine case.json geladen.</p>
        `}
      </div>
    `;
  },

  openCase(caseId){
    const found = Loader.getCases().find(item => item.id === caseId);

    if(found && found.status === "aktiv"){
      Archive.loadFall(found);
      this.close();
    }else{
      alert("Akte ist nicht aktiv oder wurde nicht gefunden.");
    }
  },

  copyCode(code){
    navigator.clipboard.writeText(code).then(() => {
      alert("Feldcode kopiert: " + code);
    }).catch(() => {
      alert("Kopieren nicht möglich. Code: " + code);
    });
  },

  resetCurrentCase(){
    const fall = Archive.getActiveFall();

    if(!fall){
      alert("Keine Akte geöffnet.");
      return;
    }

    const ok = confirm(
      `Den Fortschritt von "${fall.title}" wirklich zurücksetzen?`
    );

    if(!ok) return;

    Storage.resetFall(fall.id);

    Player.render(fall);
    Archive.renderCases();
    Archive.renderDocuments();

    const map = document.getElementById("map-container");
    if(map){
      map.innerHTML = MapSystem.render(fall);
    }

    alert("Akte erfolgreich zurückgesetzt.");
  },

  resetLocalProgress(){
    const confirmReset = confirm(
      "Wirklich den lokalen Speicherstand dieses Geräts löschen? Profil, Fortschritt und Chronik werden entfernt."
    );

    if(!confirmReset) return;

    Object.keys(localStorage).forEach(key => {
      if(key.startsWith("arkanus_")){
        localStorage.removeItem(key);
      }
    });

    alert("Lokaler Speicherstand gelöscht. Seite wird neu geladen.");
    location.reload();
  },

  close(){
    const overlay = document.getElementById("dev-overlay");
    if(overlay) overlay.classList.remove("active");
  }
};