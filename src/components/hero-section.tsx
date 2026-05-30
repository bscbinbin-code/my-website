import { CornerFrameIcon, DotIcon, DownArrowIcon } from "@/components/icons";

export function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      <video
        className="hero-video"
        src="/kookie/assets/34-67d00479a9620d3fd5cfaf2a-67d00f4727992a9707530a82_kookie-video-transcode.mp4"
        poster="/kookie/assets/33-67d00479a9620d3fd5cfaf2a-67d00f4727992a9707530a82_kookie-video-poster-00001.jpg"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="hero-tint" />
      <img
        className="hero-logo"
        src="/kookie/assets/01-684c161463c3f2157a6477d0_KOOKIE_INTRO_LOGO_BLACK_V3-1-1-p-1600.png"
        alt="KOOKIE Company Logo"
      />
      <CornerFrameIcon className="hero-frame" />
      <DotIcon className="hero-focus-dot" />
      <a className="hero-scroll" href="#about" aria-label="Scroll to about">
        <DownArrowIcon />
      </a>
      <div className="hero-caption">
        <span>KOOKIE</span>
        <span className="hero-caption-line" />
        <span>MEDIA PRODUCTION HOUSE</span>
      </div>
      <div className="hero-rec">
        <DotIcon />
        <span>REC</span>
      </div>
    </section>
  );
}
