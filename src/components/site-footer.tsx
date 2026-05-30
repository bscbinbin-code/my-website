import type { ContactOffice } from "@/types/kookie";

const offices: ContactOffice[] = [
  {
    name: "KOOKIE HQ",
    address: ["Viaduktbogen 11", "6020 Innsbruck", "Austria"],
    email: "info@kookie-kollective.com",
    phone: "+43 660 6727899",
  },
  {
    name: "KOOKIE JAPAN",
    address: ["7F Fuji Building 401", "5-14 Sakuragaokacho, Shibuya-ku", "Tokyo 150-0031", "Japan"],
    email: "japan@kookie-kollective.com",
  },
];

const links = ["PRODUCTION SERVICES", "LOCATION SCOUTING", "DIRECTORS AND CREW"];

export function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="footer-cta">
        <a href="https://www.kookie-kollective.com/contact-us">CONTACT HQ</a>
        <a href="https://www.kookie-kollective.com/contact-japan">CONTACT JP</a>
      </div>
      <div className="footer-grid">
        {offices.map((office) => (
          <address key={office.name}>
            <strong>{office.name}</strong>
            {office.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <a href={`mailto:${office.email}`}>{office.email}</a>
            {office.phone ? <a href={`tel:${office.phone.replace(/\s/g, "")}`}>{office.phone}</a> : null}
          </address>
        ))}
        <div className="footer-service-links">
          {links.map((link) => (
            <a href="https://www.kookie-kollective.com/production-services" key={link}>
              {link}
            </a>
          ))}
        </div>
      </div>
      <img
        className="footer-mask"
        src="/kookie/assets/28-685126a50b254aa3dd66e3eb_c5c948f810fa5f08363a57c44b430085_kookie-footer-mask-bold.svg"
        alt=""
      />
      <div className="footer-bottom">
        <span>So - what is next?</span>
        <div>
          <a href="https://www.kookie-kollective.com/imprint">IMPRINT</a>
          <a href="https://www.kookie-kollective.com/terms">T&amp;C</a>
        </div>
      </div>
    </footer>
  );
}
