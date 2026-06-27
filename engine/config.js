const Config = {
  version: "1.0.0",
  appName: "ARKANUS OS",
  organisation: "ARKANUS RESEARCH NETWORK",

  developer: {
    enabled: true,
    showCoordinates: true,
    allowMapClick: true,
    unlimitedUnlock: false
  },

  boot: {
    speed: 20,
    lineDelay: 150,
    finishDelay: 700
  },

  logbook: {
    maxEntries: 50
  },

  profile: {
    minNameLength: 2,
    levelSteps: [
      { level: 1, unlocked: 0 },
      { level: 2, unlocked: 4 },
      { level: 3, unlocked: 7 },
      { level: 4, unlocked: 12 }
    ]
  }
};