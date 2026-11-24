"use client";

import Link from "next/link";

export default function GlowCard({ href, className = "", style, children }) {
  const Tag = href ? Link : "div";

  function move(e) {
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - box.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - box.top}px`);
  }

  return (
    <Tag {...(href ? { href } : {})} onMouseMove={move} style={style} className={`spot glass-hover ${className}`}>
      {children}
    </Tag>
  );
}
