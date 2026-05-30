"use client";

import {
  Archive,
  Images,
  Info,
  Mail,
  Map,
  Send,
  Trash2,
} from "lucide-react";

const dockItems = [
  { label: "Photos", icon: Images },
  { label: "Archive", icon: Archive },
  { label: "Cities", icon: Map },
  { label: "About", icon: Info },
  { label: "Contact", icon: Send },
  { label: "Mail", icon: Mail },
  { label: "Trash", icon: Trash2 },
];

export function DesktopHome() {
  return (
    <main className="desktop-home" aria-label="Photography desktop home">
      <img
        className="desktop-home__background"
        src="/portfolio/desktop-bg.jpg"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="desktop-home__wash" aria-hidden="true" />
      <nav className="desktop-dock" aria-label="Primary sections">
        {dockItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              className="desktop-dock__item"
              aria-label={item.label}
              key={item.label}
              role="img"
            >
              <Icon aria-hidden="true" strokeWidth={2.1} />
              {index === 4 ? <span className="desktop-dock__divider" aria-hidden="true" /> : null}
            </div>
          );
        })}
      </nav>
    </main>
  );
}
