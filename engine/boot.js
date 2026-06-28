const Boot = {
  lines(){
    const version =
      typeof Version !== "undefined"
        ? Version.getLabel()
        : "Version unbekannt";

    return [
      "ARKANUS OS wird gestartet...",
      "Sichere Verbindung hergestellt",
      "Domain: arkanus.ch",
      "PWA-Modus aktiviert",
      "Offline-Cache geprüft",
      version,
      "Ermittlerprofil wird geladen...",
      "System bereit"
    ];
  }
};