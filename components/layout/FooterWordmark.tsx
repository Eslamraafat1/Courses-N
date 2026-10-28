"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Giant footer wordmark: letters rise one by one as the footer scrolls into view. Decorative (aria-hidden). */
export function FooterWordmark({ text = "Nexora" }: { text?: string }) {
  const reduce = useReducedMotion();
  return (
    <p aria-hidden dir="ltr" className="font-display mt-16 flex select-none justify-center overflow-hidden text-[clamp(3rem,15vw,13rem)] font-extrabold uppercase leading-[0.85] tracking-tighter">
      {text.split("").map((ch, i) => (
        <span key={`${ch}-${i}`} className="inline-block overflow-hidden pb-[0.08em]">
          <motion.span
            className="inline-block bg-gradient-to-b from-bg/25 to-bg/5 bg-clip-text text-transparent"
            initial={reduce ? false : { y: "105%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "0px 0px -5% 0px" }}
            transition={{ duration: 0.9, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {ch}
          </motion.span>
        </span>
      ))}
    </p>
  );
}
