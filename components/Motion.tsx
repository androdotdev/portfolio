"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const LAST = 3; // scenes: 0 hero, 1 about, 2 work, 3 contact

export default function Motion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const dots = Array.from(document.querySelectorAll<HTMLElement>(".dots-nav button"));

    const ctx = gsap.context(() => {
      gsap.set([".w1", ".w2", ".w3"], { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: ".scroll-space", start: "top top", end: "bottom bottom", scrub: 1.2,
          snap: { snapTo: 1 / LAST, duration: { min: 0.3, max: 0.9 }, ease: "power1.inOut" },
          onUpdate: (s) => {
            const i = Math.round(s.progress * LAST);
            dots.forEach((d, k) => d.classList.toggle("on", k === i));
          },
        },
      });

      // the moon drifts across the whole journey
      tl.to(".moon", { x: "-55vw", y: "28vh", scale: 1.5, ease: "none", duration: LAST }, 0);
      // hero leaves
      tl.to(".hero-inner", { autoAlpha: 0, scale: 1.12, y: -70, duration: 0.4 }, 0.1);

      const scene = (sel: string, i: number, last = false) => {
        tl.fromTo(sel, { autoAlpha: 0, y: 130, scale: 0.9, rotateX: 12 }, { autoAlpha: 1, y: 0, scale: 1, rotateX: 0, duration: 0.4 }, i - 0.5);
        if (!last) tl.to(sel, { autoAlpha: 0, y: -130, scale: 1.06, duration: 0.4 }, i + 0.1);
      };
      scene(".w1", 1);
      scene(".w2", 2);
      scene(".w3", 3, true);
    });

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-go]");
      if (!el) return;
      e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      gsap.to(window, { scrollTo: (Number(el.dataset.go) / LAST) * max, duration: 1.6, ease: "power3.inOut" });
    };
    document.addEventListener("click", onClick);

    return () => { document.removeEventListener("click", onClick); ctx.revert(); };
  }, []);

  return null;
}
