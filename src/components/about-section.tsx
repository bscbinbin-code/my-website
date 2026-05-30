const sideLinks = [
  "bold ideas",
  "creative solutions",
  "stunning visuals",
  "film",
  "photo",
  "cgi/vfx",
  "production",
];

export function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="section-kicker">ABOUT US</div>
      <p className="about-copy">
        We&apos;re not here to chase trends or talk in circles. We care about the
        work - how it looks, how it feels, how it holds up five years from now.
        That&apos;s it. That&apos;s the pitch.
      </p>
      <div className="about-large" aria-hidden="true">
        KOOKIE
      </div>
      <div className="about-side-links">
        {sideLinks.map((link) => (
          <a href="#" key={link}>
            {link}
          </a>
        ))}
      </div>
    </section>
  );
}
