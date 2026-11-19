"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import gsap from "gsap";
import { LuPause, LuPlay } from "react-icons/lu";
import { whenBooted } from "@/lib/boot";

export default function Notch() {
  const audio = useRef<HTMLAudioElement>(null);
  const bar = useRef<HTMLElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [vol, setVol] = useState(0.5);
  const volRef = useRef(0.5);

  const toggle = async () => {
    const a = audio.current!;
    if (a.paused) { try { await a.play(); setPlaying(true); } catch { setPlaying(false); } }
    else { a.pause(); setPlaying(false); }
  };

  useEffect(() => whenBooted(() => {
    animate(".notch", { translateY: [-40, 0], duration: 900, delay: 300, ease: "outExpo" });
  }, true), []);

  useEffect(() => {
    animate(".notch", { width: open ? 410 : 190, height: open ? 92 : 32, duration: 650, ease: "outExpo" });
  }, [open]);

  useEffect(() => { volRef.current = vol; if (audio.current) audio.current.volume = vol; }, [vol]);

  useEffect(() => {
    const onOff = () => {
      const a = audio.current;
      setOpen(false);
      if (!a) return;
      gsap.to(a, { volume: 0, duration: 0.8, onComplete: () => { a.pause(); a.currentTime = 0; a.volume = volRef.current; setPlaying(false); } });
    };
    window.addEventListener("boot-poweroff", onOff);
    return () => window.removeEventListener("boot-poweroff", onOff);
  }, []);

  useEffect(() => {
    // fired from the power-on click, so the browser allows sound
    const onPower = () => {
      const a = audio.current;
      if (a) a.play().then(() => setPlaying(true)).catch(() => {});
    };
    window.addEventListener("boot-power", onPower);
    return () => window.removeEventListener("boot-power", onPower);
  }, []);

  useEffect(() => {
    const onToggle = () => { setOpen(true); toggle(); };
    window.addEventListener("toggle-music", onToggle);
    return () => window.removeEventListener("toggle-music", onToggle);
  }, []);

  const onTime = () => {
    const a = audio.current!;
    if (bar.current && a.duration) bar.current.style.width = `${(a.currentTime / a.duration) * 100}%`;
  };

  return (
    <div className="notch-wrap">
      <div
        className={`notch ${open ? "open" : ""} ${playing ? "playing" : ""}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        onClick={() => setOpen(true)}
      >
        <audio ref={audio} src="/music/snowman.mp3" loop preload="none" onTimeUpdate={onTime} />
        <div className="notch-idle">
          <span className="eq"><i /><i /><i /></span>
          <span className="cam" />
        </div>
        <div className="notch-full">
          <button onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <LuPause /> : <LuPlay />}</button>
          <div className="notch-meta">
            <b>Snowman</b><small>Sia</small>
            <div className="bar"><i ref={(n) => { bar.current = n; }} /></div>
          </div>
          <input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => setVol(+e.target.value)} aria-label="Volume" />
        </div>
      </div>
    </div>
  );
}
