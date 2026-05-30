import type { Service } from "@/types/kookie";

const services: Service[] = [
  {
    title: "FILM",
    intro:
      "We care about the details - because in the end, that is what matters the most. Every frame is a choice. We make sure it is the right one.",
    items: ["WEB/TV SPOTS", "BRAND VIDEOS", "PRODUCT VIDEOS"],
  },
  {
    title: "PHOTO",
    intro:
      "There is a story in every moment. Nothing added. Nothing lost. Each frame, carefully seen. We let it be remembered.",
    items: ["EDITORIALS", "CAMPAIGNS", "E-COMMERCE"],
  },
  {
    title: "CGI/VFX",
    intro:
      "For images that cannot be captured, we build the impossible with the same care we bring to a camera on set.",
    items: ["3D", "POST PRODUCTION", "COMPOSITING"],
  },
  {
    title: "PRODUCTION",
    intro:
      "We handle the moving parts without letting the work lose its pulse: crew, scouting, permits, locations, logistics and the day itself.",
    items: ["PRODUCTION SERVICES", "LOCATION SCOUTING", "DIRECTORS AND CREW"],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="services-section">
      <div className="services-sticky">
        <span>REC</span>
        <span>WHAT WE DO</span>
      </div>
      <div className="services-list">
        {services.map((service, index) => (
          <article className="service-card" key={service.title}>
            <div className="service-index">{String(index + 1).padStart(2, "0")}</div>
            <h2>{service.title}</h2>
            <p>{service.intro}</p>
            <div className="service-tags">
              {service.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
