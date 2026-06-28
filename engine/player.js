const Player = {
  elements: {
    audioList: null,
    audioNote: null
  },

  activeFall: null,

  init(){
    this.elements.audioList = document.getElementById("audio-list");
    this.elements.audioNote = document.getElementById("audio-note");
  },

  render(fall){
    this.activeFall = fall;

    if(!this.elements.audioList){
      this.init();
    }

    if(!fall || !fall.chapters){
      this.elements.audioList.innerHTML = "";
      return;
    }

    const progress = Progress.getFallProgress(fall);

    this.elements.audioNote.innerHTML = `
      &gt; ${fall.title} geladen<br>
      &gt; Ermittler: ${Profile.getName()}<br>
      &gt; Audioprotokolle gefunden: ${fall.chapters.length}<br>
      &gt; Freigeschaltet: ${progress.unlocked} / ${progress.total}<br>
      &gt; Fortschritt wird lokal auf diesem Gerät gespeichert
    `;

    this.elements.audioList.innerHTML = "";

    fall.chapters.forEach((chapter, index) => {
      const isAutoLocked =
        chapter.unlockAfterInteraction &&
        !Storage.isUnlocked(fall.id, chapter.id);

      const isUnlocked =
        (!chapter.code && !isAutoLocked) ||
        Storage.isUnlocked(fall.id, chapter.id);

      const requiresLocation =
        chapter.map &&
        chapter.map.requiresLocation === true;

      const locationReached =
        !requiresLocation ||
        Storage.isLocationReached(fall.id, chapter.id);

      const canEnterCode = locationReached;

      const station = document.createElement("article");
      station.className = "station" + (isUnlocked ? "" : " locked");

      station.innerHTML = `
        <span class="badge ${isUnlocked ? "active" : locationReached && !isAutoLocked ? "active" : "danger"}">
          ${isUnlocked ? "FREIGEGEBEN" : this.getLockedBadge(chapter, locationReached)}
        </span>

        <h2>${String(index + 1).padStart(2, "0")} // ${chapter.title}</h2>

        ${this.getLockedMessage(fall, chapter, isUnlocked, locationReached, isAutoLocked)}

        ${chapter.code && !isUnlocked && canEnterCode ? `
          <p>Archivschlüssel erforderlich.</p>
          <input placeholder="Feldcode eingeben">
          <button class="primary-btn">Freischalten</button>
          <div class="message"></div>
        ` : ""}

        <div class="player ${isUnlocked ? "" : "hidden"}">
          <audio controls data-chapter="${chapter.id}">
            <source src="${chapter.audio}" type="audio/mpeg">
            Dein Browser unterstützt keine Audios.
          </audio>

          <button class="primary-btn transcript-btn" data-text="${chapter.text}">
            📄 Transkript anzeigen
          </button>

          <div class="transcript hidden"></div>
        </div>
      `;

      if(chapter.code && !isUnlocked && canEnterCode){
        this.bindUnlock(station, fall, chapter);
      }

      this.bindAudioInteraction(station, fall, chapter);
      this.bindTranscript(station, fall, chapter);

      this.elements.audioList.appendChild(station);
    });
  },

  getLockedBadge(chapter, locationReached){
    if(chapter.unlockAfterInteraction){
      return "RÄTSEL";
    }

    if(chapter.map && chapter.map.requiresLocation && !locationReached){
      return "POSITION FEHLT";
    }

    return chapter.label || "GESPERRT";
  },

  getLockedMessage(fall, chapter, isUnlocked, locationReached, isAutoLocked){
    if(isUnlocked) return "";

    if(isAutoLocked){
      const source = fall.chapters.find(item => item.id === chapter.unlockAfterInteraction);
      const sourceTitle = source ? source.title : "vorherige Akte";

      return `
        <p>🧩 Rätsel gesperrt.</p>
        <p class="meta">
          Dieses Rätsel wird automatisch freigeschaltet, sobald das Audioprotokoll
"${sourceTitle}" gehört oder das Transkript geöffnet wurde.
        </p>
      `;
    }

    if(chapter.map && chapter.map.requiresLocation && !locationReached){
      return `
        <p>📍 Position noch nicht bestätigt.</p>
        <p class="meta">Begib dich zur markierten Station und aktiviere GPS.</p>
      `;
    }

    return "";
  },

  bindUnlock(station, fall, chapter){
    const input = station.querySelector("input");
    const button = station.querySelector("button");
    const message = station.querySelector(".message");

    if(!input || !button || !message) return;

    button.addEventListener("click", () => {
      const entered = this.normalizeCode(input.value);
      const correct = this.normalizeCode(chapter.code);

      if(entered === correct){
        Decrypt.show("Archivschlüssel wird geprüft", [
          "Schlüssel empfangen",
          "Ermittlerprofil bestätigt: " + Profile.getName(),
          "Authentifizierung läuft...",
          "Datenpaket gefunden",
          "Entschlüssele Audioprotokoll...",
          "Zugriff gewährt"
        ]);

        setTimeout(() => {
          Storage.unlock(fall.id, chapter.id);
          Storage.saveLastFall(fall.id);
          Storage.saveLastChapter(chapter.id);
          Storage.log("Archivschlüssel akzeptiert: " + chapter.title);

          Decrypt.hide();

          this.render(fall);
          Archive.renderCases();
          Archive.renderDocuments();
          Profile.updateBadge();
        }, 2400);
      }else{
        message.innerText = "Zugriff verweigert. Feldcode prüfen.";
        Storage.log("Ungültiger Archivschlüssel eingegeben.");
      }
    });
  },

  bindAudioInteraction(station, fall, chapter){
    const audio = station.querySelector("audio");
    if(!audio) return;

    audio.addEventListener("play", () => {
      this.unlockInteractionTargets(fall, chapter);
    }, { once: true });
  },

  unlockInteractionTargets(fall, sourceChapter){
    const targets = fall.chapters.filter(chapter =>
      chapter.unlockAfterInteraction === sourceChapter.id
    );

    if(!targets.length) return;

    let unlockedSomething = false;

    targets.forEach(target => {
      if(!Storage.isUnlocked(fall.id, target.id)){
        Storage.unlock(fall.id, target.id);
        Storage.log("Automatisch freigegeben: " + target.title);
        unlockedSomething = true;
      }
    });

    if(unlockedSomething){
      Decrypt.show("Neue Aktensequenz freigegeben", [
        "Audioprotokoll ausgewertet",
        "Verknüpfte Daten gefunden",
        "Rätselmodul entschlüsselt",
        "Zugriff auf neue Sequenz gewährt"
      ]);

      setTimeout(() => {
        Decrypt.hide();
        this.render(fall);
        Archive.renderCases();
        Archive.renderDocuments();
        Profile.updateBadge();
      }, 1800);
    }
  },

  bindTranscript(station, fall, chapter){
    const transcriptBtn = station.querySelector(".transcript-btn");
    const box = station.querySelector(".transcript");

    if(!transcriptBtn || !box) return;

    transcriptBtn.addEventListener("click", async () => {
      if(!box.classList.contains("hidden")){
        box.classList.add("hidden");
        transcriptBtn.innerText = "📄 Transkript anzeigen";
        return;
      }

      this.unlockInteractionTargets(fall, chapter);

      transcriptBtn.innerText = "📄 Transkript ausblenden";
      box.classList.remove("hidden");

      if(box.dataset.loaded === "true") return;

      box.innerHTML = `
        <div class="terminal-note">
          &gt; OCR-Modul gestartet<br>
          &gt; Sprachaufzeichnung wird transkribiert...<br>
          &gt; Genauigkeit: 99.98 %
        </div>
      `;

      try{
        const response = await fetch(transcriptBtn.dataset.text);

        if(!response.ok){
          throw new Error("Text nicht gefunden");
        }

        const html = await response.text();

        setTimeout(() => {
          box.innerHTML = `<div class="transcript-text">${html}</div>`;
          box.dataset.loaded = "true";
          Storage.markRead(fall.id, chapter.id);
          Storage.log("Transkript geöffnet: " + chapter.title);

          Archive.renderDocuments();
        }, 900);
      }catch(e){
        box.innerHTML = `
          <div class="transcript-text">
            <p><strong>Transkript noch nicht hinterlegt.</strong></p>
            <p>Datei erwartet: <code>${transcriptBtn.dataset.text}</code></p>
          </div>
        `;
        box.dataset.loaded = "true";
      }
    });
  },

  normalizeCode(value){
    return value.trim().toUpperCase().replaceAll(" ", "").replaceAll("-", "");
  }
};