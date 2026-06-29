const Archive = {
  activeFall: null,

  elements: {
    caseGrid: null,
    documentsList: null
  },

  init(){
    this.elements.caseGrid = document.getElementById("case-grid");
    this.elements.documentsList = document.getElementById("documents-list");
    this.renderCases();
  },

  getActiveFall(){
    return this.activeFall;
  },

  renderCases(){
    if(!this.elements.caseGrid) return;

    this.elements.caseGrid.innerHTML = "";

    Loader.getCases().forEach(item => {
      const isActive = item.status === "aktiv";
      const badgeText = isActive
        ? "AKTIV"
        : item.status === "vorbereitung"
          ? "IN VORBEREITUNG"
          : "GESPERRT";

      const progress = Storage.getFallProgress(item.id, item.totalChapters || 0);

      const imageHtml = item.cover
        ? `<div class="case-image"><img src="${item.cover}" alt="Akte ${item.number}"></div>`
        : `<div class="placeholder-lock">${item.status === "vorbereitung" ? "📁" : "🔒"}</div>`;

      const card = document.createElement("article");
      card.className = "case-card" + (isActive ? "" : " locked");

      card.innerHTML = `
        ${imageHtml}
        <div class="case-body">
          <span class="badge ${isActive ? "active" : "danger"}">${badgeText}</span>
          <h2>Akte ${item.number} // ${item.title}</h2>
          <p>${item.intro}</p>
          <p class="meta">${item.internalId || item.id} // ${item.gcCode || "GC folgt"}</p>
          <p class="meta">${item.type} // ${item.location}</p>

          ${isActive ? `
            <div class="progress-wrap">
              <div class="progress-label">AKTENFORTSCHRITT ${progress.percent}%</div>
              <div class="progress-bar">
                <span style="width:${progress.percent}%"></span>
              </div>
            </div>
                  <div class="achievement-panel">
        <h3>🏅 Auszeichnungen</h3>
        ${
          Stats.getAchievements().length
            ? `<ul>
                ${Stats.getAchievements().map(item => `<li>🏅 ${item}</li>`).join("")}
              </ul>`
            : `<p class="meta">Noch keine Auszeichnungen erhalten.</p>`
        }
      </div>
          ` : ""}

          <button class="primary-btn">
            ${isActive ? (progress.percent > 0 ? "Fortsetzen" : "Akte öffnen") : "Zugriff prüfen"}
          </button>
        </div>
      `;

      card.querySelector("button").addEventListener("click", () => {
        if(!isActive){
          alert("Zugriff verweigert. Diese Akte ist noch nicht freigegeben.");
          return;
        }

        this.loadFall(item);
      });

      this.elements.caseGrid.appendChild(card);
    });
  },

  async loadFall(indexItem){
    if(typeof Sounds !== "undefined"){
  Sounds.openCase();
}

if(typeof Notify !== "undefined"){
  Notify.system("Akte wird geladen: " + indexItem.title);
}
    Decrypt.show("Akte wird geladen", [
      "Archivpfad: " + indexItem.folder,
      "Archiv-ID: " + (indexItem.gcCode || "unbekannt"),
      "Interne Kennung: " + (indexItem.internalId || indexItem.id),
      "Ermittler: " + Profile.getName(),
      "Lade Aktenstruktur...",
      "Synchronisiere Protokolle..."
    ]);

    try{
      this.activeFall = await CaseLoader.load(indexItem);

      Storage.saveLastFall(this.activeFall.id);
      Storage.log("Archivakte geöffnet: " + this.activeFall.title);

      Player.render(this.activeFall);
      Mission.updateHud(this.activeFall);
this.renderDocuments();

const mapContainer = document.getElementById("map-container");
if(mapContainer){
  mapContainer.innerHTML = MapSystem.render(this.activeFall);
}

      setTimeout(() => {
        Decrypt.hide();
        UI.showView("audio");
        Profile.updateBadge();
        this.renderCases();
      }, 900);

    }catch(error){
      Decrypt.hide();
      alert(error.message);
    }
  },

renderDocuments(){
  if(!this.elements.documentsList){
    this.elements.documentsList = document.getElementById("documents-list");
  }

  if(!this.elements.documentsList) return;

  const logs = Storage.getLogs(30);
  const lastFall = Storage.getLastFall();
  const lastVisit = Storage.getLastVisit();

  const stats = Stats.getProfileStats();
  const profileName = Profile.getName();
  const serviceNumber = Profile.getServiceNumber();

  let activeProgress = null;

  if(this.activeFall){
    activeProgress = Progress.getFallProgress(this.activeFall);
  }

  const lastVisitText = lastVisit
    ? new Date(lastVisit).toLocaleString("de-CH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "Keine Daten";

  this.elements.documentsList.innerHTML = `
    <article class="investigator-card arkanus-profile-card">
      <div class="profile-header">
        <div>
          <span class="badge active">ERMITTLERAKTE</span>
          <h2>${profileName}</h2>
          <p class="meta">ARKANUS RESEARCH NETWORK // PERSONALDOSSIER</p>
        </div>

        <div class="agent-id-card">
          <div class="agent-id-title">ARKANUS</div>
          <div class="agent-avatar">◆</div>
          <div class="agent-name">${profileName}</div>
          <div class="agent-rank">${stats.rank}</div>
          <div class="agent-number">ID: ${serviceNumber}</div>
        </div>
      </div>

      <button id="edit-profile-btn" class="secondary-btn">
        🖊 Profil bearbeiten
      </button>

      <div class="profile-grid">
        <div class="profile-field"><span>Name</span><strong>${profileName}</strong></div>
        <div class="profile-field"><span>Dienstnummer</span><strong>${serviceNumber}</strong></div>
        <div class="profile-field"><span>Dienstgrad</span><strong>${stats.rank}</strong></div>
        <div class="profile-field"><span>Level</span><strong>${stats.level}</strong></div>
        <div class="profile-field"><span>XP</span><strong>${stats.xp}</strong></div>
        <div class="profile-field"><span>Erfolge</span><strong>${stats.achievements}</strong></div>
        <div class="profile-field"><span>Freigegebene Sequenzen</span><strong>${stats.unlocked}</strong></div>
        <div class="profile-field"><span>Mitglied seit</span><strong>${Profile.getCreatedDate()}</strong></div>
        <div class="profile-field"><span>Status</span><strong>AKTIV</strong></div>
        <div class="profile-field"><span>Systemereignisse</span><strong>${stats.logs}</strong></div>
        <div class="profile-field"><span>Letzte Akte</span><strong>${lastFall || "Keine"}</strong></div>
        <div class="profile-field"><span>Letzter Zugriff</span><strong>${lastVisitText}</strong></div>
      </div>

      <div class="progress-wrap">
        <div class="progress-label">DIENSTGRAD-FORTSCHRITT</div>
        <div class="progress-bar">
          <span style="width:${Math.min(100, (stats.xp % 250) / 250 * 100)}%"></span>
        </div>
      </div>
    </article>

    ${this.activeFall ? `
    ${typeof Completion !== "undefined" && Completion.isFallCompleted(this.activeFall) ? `
  <article class="document-card completion-card">
    <span class="badge active">AKTE ABGESCHLOSSEN</span>
    <h2>${this.activeFall.title}</h2>
    <p class="meta">${this.activeFall.internalId} // ERMITTLUNG ERFOLGREICH BEENDET</p>
    <p>Alle Sequenzen wurden freigegeben. Die Ermittlungsakte wurde vollständig synchronisiert.</p>

    <div class="completion-stamp">
      ✓ ARKANUS FREIGABE ERTEILT
    </div>
  </article>
` : ""}
      <article class="document-card">
        <span class="badge active">AKTIVE ERMITTLUNGSAKTE</span>
        <h2>${this.activeFall.title}</h2>
        <p>${this.activeFall.intro}</p>
        <p class="meta">${this.activeFall.internalId || this.activeFall.id} // ${this.activeFall.gcCode || "GC folgt"}</p>
        <p class="meta">${this.activeFall.type} // ${this.activeFall.location}</p>

        <div class="progress-wrap">
          <div class="progress-label">AKTENFORTSCHRITT ${activeProgress.percent}%</div>
          <div class="progress-bar"><span style="width:${activeProgress.percent}%"></span></div>
        </div>
      </article>

      <article class="document-card">
        <span class="badge active">MISSIONSFORTSCHRITT</span>
        <h2>Freigegebene Sequenzen</h2>

        <ul class="mission-list">
          ${this.activeFall.chapters.map(chapter => {
            const unlocked = Storage.canAccessChapter(this.activeFall, chapter);
            return `
              <li class="${unlocked ? "done" : "locked"}">
                <span>${unlocked ? "✓" : "🔒"}</span>
                ${chapter.title}
              </li>
            `;
          }).join("")}
        </ul>
      </article>
    ` : `
      <article class="document-card">
        <span class="badge danger">KEINE AKTE GELADEN</span>
        <h2>Keine Ermittlungsakte aktiv</h2>
        <p>Öffne zuerst eine Akte im Archiv.</p>
      </article>
    `}

    ${Logbook.render(logs)}
  `;

  const editBtn = document.getElementById("edit-profile-btn");

  if(editBtn){
    editBtn.onclick = () => {
      Profile.showEdit();
    };
  }
},

  openFromUrl(){
    const params = new URLSearchParams(window.location.search);
    const requestedFall = params.get("fall") || params.get("akte");

    if(!requestedFall) return;

    const found = Loader.getCases().find(item => item.id === requestedFall);

    if(found && found.status === "aktiv"){
      this.loadFall(found);
    }
  }
};