import Image from "next/image";
import { HistoryBackLink } from "@/components/history-back-link";

export default function AboutPage() {
  return (
    <main className="about-page" aria-label="About BIN">
      <header className="about-page__header">
        <p>about - bin</p>
      </header>

      <HistoryBackLink className="about-page__close" aria-label="Close about page">
        close
      </HistoryBackLink>

      <section className="about-page__contact" aria-label="Social links" style={{ top: "var(--about-contact-top, clamp(300px, 32svh, 350px))" }}>
        <p>( contact )</p>
        <div
          className="about-page__social"
          style={{ fontFamily: '"PingFang SC", "Microsoft YaHei UI", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif' }}
        >
          <a href="https://www.xiaohongshu.com/user/profile/60cb1a4b000000000100866f" target="_blank" rel="noopener noreferrer" aria-label="Open Rednote profile">
            <span>小红书</span>
            <i aria-hidden="true">↗</i>
          </a>
          <a href="https://v.douyin.com/IXgcwn0MuVU/%208@1.com%20:3pm" target="_blank" rel="noopener noreferrer" aria-label="Open Douyin profile">
            <span>抖音</span>
            <i aria-hidden="true">↗</i>
          </a>
        </div>
      </section>

      <figure
        className="about-page__avatar"
        aria-label="BIN avatar"
        style={{
          top: "auto",
          right: "var(--about-avatar-right, clamp(58px, 5.2vw, 112px))",
          bottom: "var(--about-avatar-bottom, clamp(32px, 4.2svh, 72px))",
          width: "var(--about-avatar-frame-width, clamp(430px, min(31vw, 54svh), 560px))",
        }}
      >
        <Image
          src="/portfolio/about/binbin-yaya-duck.jpg"
          alt=""
          width={2481}
          height={2350}
          priority
          sizes="(max-width: 920px) 78vw, 32vw"
          style={{
            width: "min(100%, var(--about-avatar-image-width, clamp(310px, 74cqw, 430px)))",
            height: "auto",
          }}
        />
        <figcaption
          className="about-page__brand"
          aria-label="BIN"
          style={{
            display: "block",
            marginTop: "var(--about-brand-margin, clamp(18px, 2.6svh, 34px))",
            color: "#050505",
            fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            fontSize: "var(--about-brand-size, clamp(6.2rem, min(13.2vw, 18svh), 14.2rem))",
            fontWeight: 900,
            letterSpacing: "-0.085em",
            lineHeight: 0.62,
            textAlign: "center",
            transform: "var(--about-brand-transform, scaleX(1.04))",
          }}
        >
          BIN
        </figcaption>
      </figure>
    </main>
  );
}
