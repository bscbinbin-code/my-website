import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page" aria-label="About BIN">
      <section className="about-page__content">
        <p>ABOUT</p>
        <h1>BIN</h1>
      </section>
      <figure className="about-page__avatar" aria-label="BIN avatar">
        <Image src="/portfolio/about/binbin-yaya-duck.jpg" alt="" width={2481} height={2350} priority sizes="(max-width: 780px) 74vw, 30vw" />
      </figure>
      <section className="about-page__social" aria-label="Social links">
        <a href="#" aria-label="Open Rednote profile">
          <span>小红书</span>
          <i aria-hidden="true">↗</i>
        </a>
        <a href="#" aria-label="Open Douyin profile">
          <span>抖音</span>
          <i aria-hidden="true">↗</i>
        </a>
      </section>
      <Link className="about-page__back" href="/" aria-label="Back to portfolio">
        back
      </Link>
    </main>
  );
}
