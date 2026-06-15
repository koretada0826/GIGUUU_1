"use client";

import { motion } from "framer-motion";

type Props = {
  index?: string;
  children: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** A small index + label eyebrow with a hairline rule. */
export default function SectionLabel({
  index,
  children,
  align = "left",
  className = "",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-center gap-4 ${
        align === "center" ? "justify-center" : ""
      } ${className}`}
    >
      {index && (
        <span className="eyebrow text-gold/80">{index}</span>
      )}
      <span className="h-px w-10 bg-gold/40" />
      <span className="eyebrow">{children}</span>
    </motion.div>
  );
}
