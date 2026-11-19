"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { animate } from "animejs";
import { LuPower } from "react-icons/lu";

const LINES = [
  "Booting Andro OS 1.0",
  "Starting rain.service",
  "Loading moon.so",
  "Mounting ~/projects",
  "Tuning snowman.mp3",
  "Logged in as rishabh",
];

const DOWN = [
  "Stopping rain.service",
  "Unmounting ~/projects",
  "Saving session",
  "Powering off",
];

const CHROME = ".menubar, .dock, .dots-nav, .notch";

export default function Boot() {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const started = useRef(false);
  const down = useRef(false);

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    gsap.to(".boot-power", { opacity: 1, duration: 0.8, delay: 0.2 });
    return () => { tlRef.current?.kill(); };
  }, []);

  useEffect(() => {
    const shutdown = () => {
      if (!started.current || down.current) return;
      down.current = true;
      const el = root.current!;
      gsap.killTweensOf(el);
      gsap.set(el, { display: "grid", opacity: 0, scale: 1 });
      gsap.set(".boot-center, .boot-log, .boot-power", { display: "none" });
      gsap.set(".boot-down", { display: "block", opacity: 1 });
      gsap.set(".down-line", { opacity: 0, x: -8 });
      gsap.set(".crt-line", { opacity: 0, scaleX: 1 });

      const tl = gsap.timeline();
      tl.to(el, {
        opacity: 1, duration: 0.5,
        onComplete: () => {
          gsap.set(CHROME, { opacity: 0 });
          gsap.set(".ch, .hero-fade", { opacity: 0 });
          delete document.documentElement.dataset.boot;
          window.scrollTo(0, 0);
          window.dispatchEvent(new Event("boot-poweroff"));
        },
      })
        .to(".down-line", { opacity: 1, x: 0, duration: 0.2, stagger: 0.3 })
        .to(".boot-down", { opacity: 0, duration: 0.4 }, "+=0.4")
        .set(".crt-line", { opacity: 1 })
        .to(".crt-line", { scaleX: 0, duration: 0.35, ease: "power3.in" })
        .to(".crt-line", { opacity: 0, duration: 0.2 })
        .add(() => {
          gsap.set(".boot-moon", { opacity: 0, scale: 0.8 });
          gsap.set(".boot-name, .boot-bar", { opacity: 0 });
          gsap.set(".boot-fill", { width: 0 });
          gsap.set(".boot-line", { opacity: 0, x: -8 });
          gsap.set(".boot-down", { display: "none" });
          gsap.set(".boot-center, .boot-log", { clearProps: "display" });
          gsap.set(".boot-power", { display: "flex", opacity: 0, scale: 1 });
          started.current = false;
          down.current = false;
        }, "+=0.7")
        .to(".boot-power", { opacity: 1, duration: 0.8 });
    };
    window.addEventListener("shutdown", shutdown);
    return () => window.removeEventListener("shutdown", shutdown);
  }, []);

  const start = () => {
    if (started.current) return;
    started.current = true;
    // this click is the user gesture that lets the song autoplay
    window.dispatchEvent(new Event("boot-power"));

    let seen = false;
    try { seen = !!sessionStorage.getItem("booted"); } catch {}
    const total = seen ? 0.9 : 3;
    const el = root.current!;

    gsap.to(".boot-power", { opacity: 0, scale: 0.8, duration: 0.4, onComplete: () => { gsap.set(".boot-power", { display: "none" }); } });

    const tl = gsap.timeline({ delay: 0.3 });
    tlRef.current = tl;
    tl.to(".boot-moon", { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 0)
      .to(".boot-name", { opacity: 1, duration: 0.6 }, 0.3)
      .to(".boot-bar", { opacity: 1, duration: 0.3 }, 0.3)
      .to(".boot-fill", { width: "100%", duration: total - 0.4, ease: "power1.inOut" }, 0.3)
      .to(".boot-line", { opacity: 1, x: 0, duration: 0.25, stagger: (total - 0.6) / LINES.length }, 0.5);

    const timeline = new Promise<void>((r) => tl.eventCallback("onComplete", () => r()));
    const fonts = document.fonts ? document.fonts.ready.then(() => {}) : Promise.resolve();
    const loaded = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));

    Promise.all([timeline, fonts, loaded]).then(() => {
      try { sessionStorage.setItem("booted", "1"); } catch {}

      gsap.set(".menubar, .dock, .dots-nav, .notch", { opacity: 0 });
      animate(".menubar", { translateY: [-32, 0], opacity: [0, 1], duration: 900, ease: "outExpo" });
      animate(".dock", { translateY: [90, 0], opacity: [0, 1], duration: 1000, delay: 250, ease: "outExpo" });
      animate(".dots-nav", { opacity: [0, 1], duration: 1000, delay: 700, ease: "outQuad" });
      animate(".notch", { opacity: [0, 1], duration: 500, ease: "outQuad" });

      document.documentElement.dataset.boot = "done";
      window.dispatchEvent(new Event("boot-done"));

      gsap.to(el, {
        opacity: 0, scale: 1.04, duration: 1, ease: "power2.inOut",
        onComplete: () => { el.style.display = "none"; },
      });
    });
  };

  return (
    <div className="boot" ref={root}>
      <button className="boot-power" onClick={start} aria-label="Power on">
        <LuPower />
        <span>Press to power on</span>
      </button>
      <div className="boot-center">
        <div className="boot-moon" />
        <div className="boot-name">Andro OS</div>
        <div className="boot-bar"><div className="boot-fill" /></div>
      </div>
      <div className="boot-down">
        {DOWN.map((l) => (
          <div className="down-line" key={l}><b>[ ok ]</b> {l}</div>
        ))}
      </div>
      <div className="crt-line" />
      <div className="boot-log">
        {LINES.map((l, i) => (
          <div className="boot-line" key={l}>{i < LINES.length - 1 ? <b>[ ok ]</b> : <b>[ &gt;&gt; ]</b>} {l}</div>
        ))}
      </div>
    </div>
  );
}
