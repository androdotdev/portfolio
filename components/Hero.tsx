"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { whenBooted } from "@/lib/boot";

const NAME = ["Rishabh", "Madhwal"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => whenBooted(() => {
    const el = root.current!;
    animate(el.querySelectorAll(".ch"), {
      opacity: [0, 1], translateY: [70, 0],
      duration: 1500, ease: "outExpo", delay: stagger(55, { start: 200 }),
    });
    animate(el.querySelectorAll(".hero-fade"), {
      opacity: [0, 1], translateY: [20, 0],
      duration: 1200, ease: "outQuad", delay: stagger(160, { start: 1000 }),
    });
  }, true), []);

  return (
    <section ref={root} className="hero" id="top">
      <div className="wrap hero-inner">
        <p className="eyebrow hero-fade">Solo developer</p>
        <h1 className="display" aria-label={NAME.join(" ")}>
          {NAME.map((word) => (
            <span className="word" key={word} aria-hidden>
              {word.split("").map((c, i) => (
                <span className="ch" key={i}>{c}</span>
              ))}
            </span>
          ))}
        </h1>
        <p className="lede hero-fade">
          BCA student in Ghaziabad. I build backend infrastructure, AI tooling and developer tools, mostly alone, mostly in TypeScript.
        </p>
        <div className="cta hero-fade">
          <a className="btn solid" href="#" data-go="2">See my work</a>
          <a className="btn" href="#" data-go="3">Say hello</a>
        </div>
      </div>
    </section>
  );
}
