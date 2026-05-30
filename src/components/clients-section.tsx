const rows = [
  ["ZARA", "ADIDAS", "INNIO", "YETI"],
  ["BROOKS", "THE NORTHFACE", "MONSROYALE", "ZARA"],
  ["MERCEDES", "TIROL", "AK", "ÖTZTAL"],
  ["EXICOM", "DALBELLO", "TQ", "MANGO"],
];

export function ClientsSection() {
  return (
    <section id="clients" className="clients-section">
      <div className="section-kicker">CLIENTS</div>
      <div className="client-marquee" aria-label="Client list">
        {rows.map((row, rowIndex) => (
          <div className="client-row" key={row.join("-")}>
            {[...row, ...row, ...row].map((name, index) => (
              <span key={`${rowIndex}-${name}-${index}`}>{name}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
