import { HistoryBackLink } from "@/components/history-back-link";
import { MorePhotoField } from "@/components/more-photo-field";

export default function MorePage() {
  return (
    <main className="more-page" aria-label="More BIN photos">
      <MorePhotoField />

      <footer className="more-page__chrome" aria-label="More page navigation">
        <HistoryBackLink className="more-page__brand" aria-label="Back to BIN home" transitionVariant="more-exit">
          BIN
        </HistoryBackLink>
        <nav className="more-page__nav" aria-label="More page links">
          <HistoryBackLink aria-label="Close more page" transitionVariant="more-exit">
            close
          </HistoryBackLink>
        </nav>
      </footer>

      <header className="more-page__header" aria-hidden="true">
        <p>more</p>
        <HistoryBackLink tabIndex={-1} transitionVariant="more-exit">
          close
        </HistoryBackLink>
      </header>
    </main>
  );
}
