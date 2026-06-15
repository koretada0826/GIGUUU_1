"use client";

import { forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "line" | "ghost";
  className?: string;
  "aria-label"?: string;
};

/**
 * Thin-lined luxury CTA. A hairline border with a light streak on hover,
 * letter-spaced uppercase label. No fat radii, no loud colour.
 */
const LuxuryButton = forwardRef<HTMLAnchorElement, Props>(function LuxuryButton(
  { children, href = "#", onClick, variant = "line", className = "", ...rest },
  ref
) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden px-8 py-4 text-[0.7rem] uppercase tracking-[0.32em] text-platinum transition-colors duration-500 ease-luxe";
  const border =
    variant === "line"
      ? "border border-platinum/25 hover:border-gold/70"
      : "border border-transparent hover:text-diamond";

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      className={`${base} ${border} ${className}`}
      {...rest}
    >
      {/* hover wash */}
      <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      {/* light streak on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-diamond/30 to-transparent opacity-0 transition-all duration-700 ease-luxe group-hover:left-[120%] group-hover:opacity-100" />
      <span className="relative z-10 transition-transform duration-500 ease-luxe group-hover:translate-x-0.5">
        {children}
      </span>
      <span
        aria-hidden
        className="relative z-10 inline-block h-px w-6 origin-left scale-x-100 bg-current opacity-60 transition-all duration-500 ease-luxe group-hover:w-9 group-hover:opacity-100"
      />
    </a>
  );
});

export default LuxuryButton;
