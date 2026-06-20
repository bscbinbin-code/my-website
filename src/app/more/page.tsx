import Link from "next/link";
import { MorePhotoField } from "@/components/more-photo-field";

export default function MorePage() {
  return (
    <main className="more-page" aria-label="More BIN photos">
      <MorePhotoField />

      <footer className="more-page__chrome" aria-label="More page navigation">
        <Link className="more-page__brand" href="/" aria-label="Back to BIN home">
          BIN
        </Link>
        <nav className="more-page__nav" aria-label="More page links">
          <Link href="/" aria-label="Close more page">
            close
          </Link>
        </nav>
      </footer>

      <header className="more-page__header" aria-hidden="true">
        <p>more</p>
        <Link tabIndex={-1} href="/">
          close
        </Link>
      </header>
    </main>
  );
}
