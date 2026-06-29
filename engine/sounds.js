const Sounds = {
  enabled: true,
  volume: 0.08,
  ctx: null,

  init(){
    try{
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }catch(e){
      this.enabled = false;
    }
  },

  play(freq = 440, duration = 0.08, type = "sine"){
    if(!this.enabled) return;

    if(!this.ctx){
      this.init();
    }

    if(!this.ctx) return;
if(this.ctx.state === "suspended"){
  this.ctx.resume();
}
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.value = this.volume;

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.ctx.currentTime + duration
    );

    osc.stop(this.ctx.currentTime + duration);
  },

  click(){
    this.play(620, 0.035, "square");
  },
boot(){
  this.play(260, 0.05, "square");

  setTimeout(() => {
    this.play(340, 0.05, "square");
  }, 120);

  setTimeout(() => {
    this.play(520, 0.08, "triangle");
  }, 260);
},

terminal(){
  this.play(430, 0.018, "square");
},
  success(){
    this.play(740, 0.08, "sine");

    setTimeout(() => {
      this.play(980, 0.10, "sine");
    }, 90);
  },

  error(){
    this.play(180, 0.12, "sawtooth");

    setTimeout(() => {
      this.play(120, 0.12, "sawtooth");
    }, 110);
  },

  unlock(){
    this.play(520, 0.08, "triangle");

    setTimeout(() => {
      this.play(860, 0.12, "triangle");
    }, 100);
  },

  gps(){
    this.play(1200, 0.06, "sine");

    setTimeout(() => {
      this.play(950, 0.06, "sine");
    }, 90);
  },

  mission(){
    this.play(320, 0.12, "triangle");

    setTimeout(() => {
      this.play(540, 0.16, "triangle");
    }, 130);
  },

  reward(){
    this.play(880, 0.08, "sine");

    setTimeout(() => {
      this.play(1170, 0.10, "sine");
    }, 90);
  },
  openCase(){
  this.play(300, 0.08, "triangle");

  setTimeout(() => {
    this.play(460, 0.08, "triangle");
  }, 90);
},

alarm(){
  this.play(160, 0.10, "sawtooth");

  setTimeout(() => {
    this.play(120, 0.10, "sawtooth");
  }, 120);

  setTimeout(() => {
    this.play(160, 0.10, "sawtooth");
  }, 240);
},
    toggle(){
  const saved = localStorage.getItem("arkanus_sound_enabled");

  this.enabled = saved === "false";

  localStorage.setItem(
    "arkanus_sound_enabled",
    this.enabled ? "true" : "false"
  );

  this.updateButton();

  if(this.enabled){
    this.init();

    if(this.ctx && this.ctx.state === "suspended"){
      this.ctx.resume();
    }

    setTimeout(() => {
      this.success();
    }, 120);
  }

  if(typeof Notify !== "undefined"){
    Notify.system(
      this.enabled
        ? "Systemsound aktiviert"
        : "Systemsound deaktiviert"
    );
  }
},

loadSetting(){
  const saved = localStorage.getItem("arkanus_sound_enabled");

  this.enabled = saved !== "false";

  this.updateButton();
},

  updateButton(){
    const btn = document.getElementById("sound-toggle-btn");
    if(!btn) return;

    btn.innerText = this.enabled ? "🔊 Sound: AN" : "🔇 Sound: AUS";
  }
};