import type { SVGProps } from "react";

export function CornerFrameIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 72" aria-hidden="true" {...props}>
      <path d="M1 25V1h24M95 1h24v24M119 47v24H95M25 71H1V47" />
    </svg>
  );
}

export function DownArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 48" aria-hidden="true" {...props}>
      <path d="M16 4v36M8 32l8 8 8-8" />
    </svg>
  );
}

export function DotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="5" />
    </svg>
  );
}
