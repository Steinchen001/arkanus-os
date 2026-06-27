const MapSystem = {
  activeFall: null,
  map: null,
  layerGroup: null,
  
  watchId: null,
playerMarker: null,

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
          ${fall.chapters.map(chapter => {
            const visible = this.isChapterVisibleOnMap(fall, chapter);

            return `
              <li class="${visible ? "done" : "locked"}">
                <span>${visible ? "🟢" : "🔒"}</span>
                ${visible ? chapter.title : "Verschlüsselte Position"}
              </li>
            `;
          }).join("")}
        </ul>
      </article>
    `;
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

const marker = L.marker([point.lat, point.lng], {
    icon
});

      marker.bindPopup(`
        <strong>${point.title}</strong><br>
        Status: freigegeben<br>
        ${point.rawLat}<br>
        ${point.rawLng}
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

// Entwickler: Klick auf Karte
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
const gpsBtn = document.getElementById("gps-start-btn");

if (gpsBtn) {
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
}
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

        (position)=>{
const gpsStatus = document.getElementById("gps-status");

if(gpsStatus){
    gpsStatus.innerText = "GPS verbunden ✔";
}
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            if(this.playerMarker){
                this.playerMarker.setLatLng([lat,lng]);
                return;
            }

            this.playerMarker = L.marker([lat,lng], {
    icon: L.divIcon({
        className: "",
        html: `<div class="player-dot">📍</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
    })
}).addTo(this.map);

        },

        (error)=>{

    console.log(error);

    const gpsStatus = document.getElementById("gps-status");

    if(gpsStatus){
        gpsStatus.innerText =
            `Fehler ${error.code}: ${error.message}`;
    }

},

        {

            enableHighAccuracy:true,

            maximumAge:1000,

            timeout:10000

        }

    );

},
getVisiblePoints(fall){
    return fall.chapters
      .filter(chapter => this.isChapterVisibleOnMap(fall, chapter))
      .map(chapter => {
        const coords = chapter.map.coordinates;
        const parsed = this.parseGeoCoordinates(coords.lat, coords.lng);

        return {
          id: chapter.id,
          title: chapter.title,
          lat: parsed.lat,
          lng: parsed.lng,
          rawLat: coords.lat,
          rawLng: coords.lng
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
      return !chapter.code || Storage.isUnlocked(fall.id, chapter.id);
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