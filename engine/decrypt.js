const Decrypt = {
  show(title, lines){
    let overlay = document.getElementById("decrypt-overlay");

    if(!overlay){
      overlay = document.createElement("div");
      overlay.id = "decrypt-overlay";
      overlay.innerHTML = `
        <div class="decrypt-box">
          <h2 id="decrypt-title"></h2>
          <div id="decrypt-lines"></div>
          <div class="decrypt-bar"><span></span></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    document.getElementById("decrypt-title").innerText = title;
    document.getElementById("decrypt-lines").innerHTML =
      lines.map(line => "&gt; " + line).join("<br>");

    overlay.classList.add("active");
  },

  hide(){
    const overlay = document.getElementById("decrypt-overlay");
    if(overlay){
      overlay.classList.remove("active");
    }
  }
};