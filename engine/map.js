const MapSystem = {
  activeFall: null,
  map: null,
  layerGroup: null,

  watchId: null,
  playerMarker: null,
  lastPlayerPosition: null,

  init(){
    // Platzhalter für spätere Kartenfunktionen
  },

  render(fall){
    this.activeFall = fall;

    if(!fall || !fall.chapters){
      return `
        <article class="document-card">
          <span class="badge danger">KEINE AKTE GELADEN</span>
          <h2>Keine Ermittlerkarte verfügbar</h2>
          <p>Öffne zuerst eine Akte im Archiv.</p>
        </article>
      `;
    }

    setTimeout(() => {
      this.buildLeafletMap(fall);
    }, 100);

    const mapChapters = fall.chapters.filter(chapter =>
      chapter.map &&
      chapter.map.coordinates
    );

    return `
      <article class="document-card">
        <span class="badge active">ERMITTLERKARTE</span>
        <h2>${fall.title}</h2>
        <p class="meta">Interaktive Stationskarte // Marker erscheinen nach Freischaltung</p>

        <div class="gps-panel">
          <button id="gps-start-btn" class="secondary-btn">
            📡 Standort aktivieren
          </button>
          <div id="gps-status" class="gps-status">
            GPS nicht aktiv
          </div>
        </div>

        <div id="leaflet-map"></div>

        <ul class="mission-list map-station-list">
          ${mapChapters.map(chapter => {
            const visible = this.isChapterVisibleOnMap(fall, chapter);
            const status = Storage.getChapterStatus(fall, chapter);

            return `
              <li class="${visible ? "done" : "locked"}">
                <span>${visible ? "🟢" : "🔒"}</span>
                ${visible ? chapter.title : this.getHiddenMapLabel(status)}
              </li>
            `;
          }).join("")}
        </ul>
      </article>
    `;
  },

  getHiddenMapLabel(status){
    if(status === "location_missing") return "Position bekannt // Standort ausstehend";
    if(status === "waiting") return "Rätselposition verschlüsselt";
    if(status === "code_required") return "Feldcode erforderlich";
    return "Verschlüsselte Position";
  },

  buildLeafletMap(fall){
    const mapElement = document.getElementById("leaflet-map");
    if(!mapElement || typeof L === "undefined") return;

    if(this.map){
      this.map.remove();
      this.map = null;
    }

    this.playerMarker = null;

    const visiblePoints = this.getVisiblePoints(fall);

    const center = visiblePoints.length
      ? [visiblePoints[0].lat, visiblePoints[0].lng]
      : [47.478, 9.039];

    this.map = L.map("leaflet-map", {
      zoomControl: true,
      attributionControl: true
    }).setView(center, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);

    visiblePoints.forEach(point => {
      const icon = L.divIcon({
        className: "",
        html: `
          <div class="arkanus-marker">
            📍
          </div>
        `,
        iconSize: [36,36],
        iconAnchor: [18,18]
      });

      const marker = L.marker([point.lat, point.lng], { icon });

      marker.bindPopup(`
        <strong>${point.title}</strong><br>
        Status: ${this.getPointStatusText(point)}<br>
        ${point.rawLat}<br>
        ${point.rawLng}<br><br>
        <a href="https://maps.apple.com/?daddr=${point.lat},${point.lng}" target="_blank">
          🧭 Navigation starten
        </a>
      `);

      marker.addTo(this.layerGroup);
    });

    if(visiblePoints.length > 1){
      L.polyline(
        visiblePoints.map(point => [point.lat, point.lng]),
        {
          weight: 3,
          opacity: 0.75
        }
      ).addTo(this.layerGroup);
    }

    if(visiblePoints.length > 1){
      this.map.fitBounds(
        visiblePoints.map(point => [point.lat, point.lng]),
        { padding: [30, 30] }
      );
    }

    setTimeout(() => {
      this.map.invalidateSize();
    }, 250);

    this.bindDevMapClick();
    this.bindGpsButton();
  },

  getPointStatusText(point){
    if(point.status === "unlocked") return "freigegeben";
    if(point.status === "location_missing") return "Standortprüfung erforderlich";
    if(point.status === "code_required") return "Feldcode erforderlich";
    if(point.status === "waiting") return "wartet auf vorherige Sequenz";
    return "verschlüsselt";
  },

  bindGpsButton(){
    const gpsBtn = document.getElementById("gps-start-btn");

    if(!gpsBtn) return;

    gpsBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.startGps();
    });

    gpsBtn.addEventListener("touchend", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.startGps();
    });
  },

  bindDevMapClick(){
    if(!this.map) return;

    this.map.on("click", (e) => {
      if(!Config.developer.enabled || !Config.developer.allowMapClick) return;

      const lat = this.decimalToGeo(e.latlng.lat, true);
      const lng = this.decimalToGeo(e.latlng.lng, false);

      navigator.clipboard.writeText(`${lat}\n${lng}`);

      L.popup()
        .setLatLng(e.latlng)
        .setContent(`
          <b>Neue Station</b><br><br>
          ${lat}<br>
          ${lng}<br><br>
          📋 In Zwischenablage kopiert
        `)
        .openOn(this.map);
    });
  },

  startGps(){
    const gpsStatus = document.getElementById("gps-status");

    if(!navigator.geolocation){
      if(gpsStatus) gpsStatus.innerText = "GPS nicht unterstützt";
      return;
    }

    if(gpsStatus) gpsStatus.innerText = "GPS wird gestartet...";

    if(this.watchId){
      navigator.geolocation.clearWatch(this.watchId);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.lastPlayerPosition = { lat, lng };

        this.updatePlayerMarker(lat, lng);
        this.updateGpsDistance(lat, lng);

        const gpsBtn = document.getElementById("gps-start-btn");
        if(gpsBtn){
          gpsBtn.innerText = "🔄 Standort aktualisieren";
        }

        if(this.map){
          this.map.setView([lat, lng], 14);
        }
      },

      (error) => {
        console.log(error);

        const gpsStatus = document.getElementById("gps-status");

        if(gpsStatus){
          gpsStatus.innerText = `Fehler ${error.code}: ${error.message}`;
        }
      },

      {
        enableHighAccuracy:true,
        maximumAge:1000,
        timeout:10000
      }
    );
  },

  updatePlayerMarker(lat, lng){
    if(!this.map) return;

    if(this.playerMarker){
      this.playerMarker.setLatLng([lat,lng]);
      return;
    }

    this.playerMarker = L.circleMarker([lat,lng],{
      radius:8,
      color:"#0080ff",
      fillColor:"#00aaff",
      fillOpacity:1,
      weight:3
    }).addTo(this.map);
  },

  updateGpsDistance(playerLat, playerLng){
    const gpsStatus = document.getElementById("gps-status");
    if(!gpsStatus || !this.activeFall) return;

    const points = this.getVisiblePoints(this.activeFall);

    if(!points.length){
      gpsStatus.innerText = "GPS verbunden ✔";
      return;
    }

    let nearest = null;
    let nearestDistance = Infinity;

    points.forEach(point => {
      const distance = this.getDistanceMeters(
        playerLat,
        playerLng,
        point.lat,
        point.lng
      );

      if(distance < nearestDistance){
        nearestDistance = distance;
        nearest = point;
      }
    });

    if(!nearest) return;

    const distanceText = nearestDistance >= 1000
      ? (nearestDistance / 1000).toFixed(2) + " km"
      : Math.round(nearestDistance) + " m";

    if(nearest.requiresLocation && nearestDistance <= nearest.unlockRadius){
      gpsStatus.innerText =
        `📍 Station erreicht ✔ // ${nearest.requiresCode ? "Schlüssel erforderlich" : "Kein Schlüssel nötig"}`;

      Storage.setLocationReached(this.activeFall.id, nearest.id);
      
      if(typeof Sounds !== "undefined"){
  Sounds.gps();
}

if(typeof Notify !== "undefined"){
  Notify.gps("Station erreicht: " + nearest.title);
}

Player.render(this.activeFall);
Archive.renderDocuments();

if(typeof Mission !== "undefined"){
  Mission.updateHud(this.activeFall);
}

return;
    }

    gpsStatus.innerText =
      `GPS verbunden ✔ // Nächste Station: ${distanceText}`;
  },

  getDistanceMeters(lat1, lng1, lat2, lng2){
    const R = 6371000;
    const toRad = value => value * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  getVisiblePoints(fall){
    return fall.chapters
      .filter(chapter => this.isChapterVisibleOnMap(fall, chapter))
      .map(chapter => {
        const coords = chapter.map.coordinates;
        const parsed = this.parseGeoCoordinates(coords.lat, coords.lng);
        const status = Storage.getChapterStatus(fall, chapter);

        return {
          id: chapter.id,
          title: chapter.title,

          lat: parsed.lat,
          lng: parsed.lng,

          rawLat: coords.lat,
          rawLng: coords.lng,

          unlockRadius: chapter.map.unlockRadius || 25,
          requiresLocation: chapter.map.requiresLocation || false,
          requiresCode: chapter.map.requiresCode || false,
          status
        };
      })
      .filter(point => point.lat !== null && point.lng !== null);
  },

  isChapterVisibleOnMap(fall, chapter){
    if(!chapter.map || !chapter.map.visible || !chapter.map.coordinates){
      return false;
    }

    if(chapter.map.visible === true || chapter.map.visible === "always"){
      return true;
    }

    if(chapter.map.visible === "after_unlock"){
      return Storage.canAccessChapter(fall, chapter);
    }

    return false;
  },

  parseGeoCoordinates(latText, lngText){
    return {
      lat: this.parseSingleCoordinate(latText),
      lng: this.parseSingleCoordinate(lngText)
    };
  },

  parseSingleCoordinate(value){
    if(!value || typeof value !== "string") return null;

    const clean = value
      .trim()
      .toUpperCase()
      .replace(",", ".")
      .replace("°", " ")
      .replace("'", " ")
      .replace("’", " ")
      .replace(/\s+/g, " ");

    const match = clean.match(/^([NSEW])\s*(\d{1,3})\s+(\d{1,2}\.\d+)$/);

    if(!match) return null;

    const direction = match[1];
    const degrees = parseFloat(match[2]);
    const minutes = parseFloat(match[3]);

    let decimal = degrees + (minutes / 60);

    if(direction === "S" || direction === "W"){
      decimal *= -1;
    }

    return decimal;
  },

  decimalToGeo(decimal, isLat){
    const dir =
      isLat
        ? (decimal >= 0 ? "N" : "S")
        : (decimal >= 0 ? "E" : "W");

    decimal = Math.abs(decimal);

    const degrees = Math.floor(decimal);
    const minutes = ((decimal - degrees) * 60).toFixed(3);

    const deg =
      isLat
        ? String(degrees).padStart(2,"0")
        : String(degrees).padStart(3,"0");

    return `${dir}${deg}° ${minutes}`;
  }
};