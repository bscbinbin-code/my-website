const navItems = [
  ["About", "#about"],
  ["Work", "#work"],
  ["Clients", "#clients"],
  ["Contact", "#contact"],
];

export function SiteHeader() {
  return (
    <header className="kookie-header" aria-label="Primary navigation">
      <a className="kookie-wordmark" href="#hero">
        KOOKIE
      </a>
      <nav className="kookie-nav">
        {navItems.map(([label, href]) => (
          <a key={label} href={href}>
            {label}
          </a>
        ))}
      </nav>
      <div className="kookie-social">
        <a href="https://www.instagram.com/kookie_kollective/">IG</a>
        <a href="https://www.linkedin.com/company/kookie-kollective/">LinkedIn</a>
        <a href="https://vimeo.com/user213590819">Vimeo</a>
      </div>
    </header>
  );
}
