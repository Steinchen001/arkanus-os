const Notify = {

  show(title, text){

    let toast = document.getElementById("system-toast");

    if(!toast){

      toast = document.createElement("div");
      toast.id = "system-toast";

      toast.innerHTML = `
        <div class="toast-title"></div>
        <div class="toast-text"></div>
      `;

      document.body.appendChild(toast);

    }

    toast.querySelector(".toast-title").innerText = title;
    toast.querySelector(".toast-text").innerText = text;

    toast.classList.add("active");

    if("vibrate" in navigator){
      navigator.vibrate(35);
    }

    clearTimeout(this.timer);

    this.timer = setTimeout(() => {
      toast.classList.remove("active");
    },3000);

  },

  system(text){
    this.show("SYSTEM",text);
  },

  mission(text){
    this.show("MISSION",text);
  },

  audio(text){
    this.show("AUDIO",text);
  },

  gps(text){
    this.show("GPS",text);
  },

  success(text){
    this.show("ERFOLG",text);
  },

  error(text){
    this.show("FEHLER",text);
  }

};