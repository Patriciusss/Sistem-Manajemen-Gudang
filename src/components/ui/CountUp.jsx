"use client";

import { useEffect, useState } from "react";

export default function CountUp({ value, prefix = "" }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const steps = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 25;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setShown(Math.round((value * step) / steps));
      if (step === steps) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <>
      {prefix}
      {shown.toLocaleString("id-ID")}
    </>
  );
}
