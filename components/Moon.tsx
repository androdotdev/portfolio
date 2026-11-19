"use client";
import { useEffect } from "react";
import { animate } from "animejs";

export default function Moon() {
  useEffect(() => {
    const a = [
      animate(".moon-halo", { opacity: [0.65, 1], scale: [1, 1.1], duration: 7000, ease: "inOutSine", loop: true, alternate: true }),
      animate(".moon-disc", { translateY: [0, -10], duration: 9000, ease: "inOutSine", loop: true, alternate: true }),
      animate(".cloud.c1", { translateX: ["-12vw", "14vw"], duration: 42000, ease: "linear", loop: true, alternate: true }),
      animate(".cloud.c2", { translateX: ["10vw", "-14vw"], duration: 58000, ease: "linear", loop: true, alternate: true }),
    ];
    return () => a.forEach((x) => x.pause());
  }, []);

  return (
    <div className="moon" aria-hidden>
      <div className="moon-halo" />
      <div className="moon-disc">
        <span className="crater k1" /><span className="crater k2" /><span className="crater k3" /><span className="crater k4" />
      </div>
      <div className="cloud c1" />
      <div className="cloud c2" />
    </div>
  );
}
