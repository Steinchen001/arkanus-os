const Logbook = {
  render(logs){
    if(!logs || !logs.length){
      return `
        <article class="document-card">
          <span class="badge active">SYSTEMPROTOKOLL</span>
          <h2>Noch keine Einträge</h2>
          <p>Aktionen werden lokal auf diesem Gerät protokolliert.</p>
        </article>
      `;
    }

    const items = logs.slice(0, 10).map(entry => {
      const date = new Date(entry.time);
      const time = date.toLocaleString("de-CH", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });

      return `<li><span>${time}</span> ${entry.text}</li>`;
    }).join("");

    return `
      <article class="document-card">
        <span class="badge active">SYSTEMPROTOKOLL</span>
        <h2>Chronik</h2>
        <ul class="logbook">${items}</ul>
      </article>
    `;
  }
};