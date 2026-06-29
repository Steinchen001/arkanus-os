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

          <button class="primary-btn" onclick="Dev.clearCachesKeepProfile()">
            🧹 Browser-Cache löschen // Profil behalten
          </button>

          <button class="primary-btn" onclick="Dev.reloadHard()">
            🔄 Hart neu laden
          </button>

          <button class="primary-btn" onclick="Dev.unlockAllCurrentCase()">
            🔓 Aktive Akte komplett freischalten
          </button>

          <button class="primary-btn" onclick="Dev.markAllLocationsReached()">
            📍 Alle Standorte als erreicht markieren
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
          <h4>Kapitel / Feldcodes</h4>
          <ul class="dev-code-list">
            ${detail.chapters.map(chapter => `
  <li>
    <div class="dev-code-main">
      <span>${chapter.title}</span>
      <code>${chapter.code || "FREI"}</code>
    </div>

    <div class="dev-code-actions">
      <button onclick="Dev.unlockChapter('${detail.id}', '${chapter.id}')">🔓</button>
      <button onclick="Dev.markLocation('${detail.id}', '${chapter.id}')">📍</button>
      <button onclick="Dev.lockChapter('${detail.id}', '${chapter.id}')">🔒</button>
      ${chapter.code ? `<button onclick="Dev.copyCode('${chapter.code}')">📋</button>` : ""}
    </div>
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

  refreshAll(fall = null){
    if(fall){
      Player.render(fall);
      Archive.renderCases();
      Archive.renderDocuments();

      if(typeof Mission !== "undefined"){
        Mission.updateHud(fall);
      }

      const map = document.getElementById("map-container");
      if(map){
        map.innerHTML = MapSystem.render(fall);
      }
    }

    Profile.updateBadge();
  },

  unlockChapter(fallId, chapterId){
    Storage.unlock(fallId, chapterId);
    Storage.log("DEV: Kapitel freigeschaltet: " + chapterId);

    const fall = Archive.getActiveFall();
    this.refreshAll(fall);

    alert("Kapitel freigeschaltet.");
  },

  lockChapter(fallId, chapterId){
    localStorage.removeItem(Storage.key(fallId, chapterId));
    localStorage.removeItem(Storage.key(fallId, chapterId, "location"));
    localStorage.removeItem(Storage.key(fallId, chapterId, "read"));

    Storage.log("DEV: Kapitel zurückgesetzt: " + chapterId);

    const fall = Archive.getActiveFall();
    this.refreshAll(fall);

    alert("Kapitel zurückgesetzt.");
  },

  markLocation(fallId, chapterId){
    Storage.setLocationReached(fallId, chapterId);
    Storage.log("DEV: Standort erreicht simuliert: " + chapterId);

    const fall = Archive.getActiveFall();
    this.refreshAll(fall);

    alert("Standort als erreicht markiert.");
  },

  unlockAllCurrentCase(){
    const fall = Archive.getActiveFall();

    if(!fall){
      alert("Keine Akte geöffnet.");
      return;
    }

    const ok = confirm(`Alle Kapitel von "${fall.title}" freischalten?`);
    if(!ok) return;

    fall.chapters.forEach(chapter => {
      Storage.unlock(fall.id, chapter.id);
      Storage.setLocationReached(fall.id, chapter.id);
      Storage.markRead(fall.id, chapter.id);
    });

    Storage.log("DEV: Aktive Akte komplett freigeschaltet.");

    this.refreshAll(fall);

    alert("Aktive Akte komplett freigeschaltet.");
  },

  markAllLocationsReached(){
    const fall = Archive.getActiveFall();

    if(!fall){
      alert("Keine Akte geöffnet.");
      return;
    }

    fall.chapters.forEach(chapter => {
      if(chapter.map && chapter.map.requiresLocation){
        Storage.setLocationReached(fall.id, chapter.id);
      }
    });

    Storage.log("DEV: Alle Standorte der aktiven Akte simuliert.");

    this.refreshAll(fall);

    alert("Alle Standorte als erreicht markiert.");
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
    Storage.log("DEV: Aktive Akte zurückgesetzt.");

    this.refreshAll(fall);

    alert("Akte erfolgreich zurückgesetzt.");
  },

  async clearCachesKeepProfile(){
    const ok = confirm(
      "Alle Browser-Caches und Service Worker löschen?\n\nDas Ermittlerprofil bleibt erhalten."
    );

    if(!ok) return;

    if("caches" in window){
      const keys = await caches.keys();

      for(const key of keys){
        await caches.delete(key);
      }
    }

    if("serviceWorker" in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();

      for(const reg of regs){
        await reg.unregister();
      }
    }

    sessionStorage.removeItem("arkanus_reloading");

    alert("Cache gelöscht. Profil bleibt erhalten. Seite wird neu geladen.");
    window.location.reload();
  },

  reloadHard(){
    window.location.href = window.location.pathname + "?reload=" + Date.now();
  },

  resetLocalProgress(){
    const confirmReset = confirm(
      "Wirklich den gesamten lokalen Speicher löschen?\n\nProfil, Fortschritt und Chronik werden entfernt."
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