"use client";
import { useRef } from "react";
import { FaGithub } from "react-icons/fa6";
import { LuFolderOpen, LuMail, LuMoon, LuMusic, LuUser } from "react-icons/lu";

const items = [
  { label: "Home", icon: <LuMoon />, go: 0 },
  { label: "About", icon: <LuUser />, go: 1 },
  { label: "Work", icon: <LuFolderOpen />, go: 2 },
  { label: "Contact", icon: <LuMail />, go: 3 },
  { label: "GitHub", icon: <FaGithub />, href: "https://github.com/androdotdev" },
  { label: "Music", icon: <LuMusic />, music: true },
];

export default function Dock() {
  const dock = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    dock.current!.querySelectorAll<HTMLElement>(".dock-item").forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      el.style.transform = `scale(${1 + 0.65 * Math.max(0, 1 - d / 120)})`;
    });
  };
  const reset = () => dock.current!.querySelectorAll<HTMLElement>(".dock-item").forEach((el) => (el.style.transform = ""));

  return (
    <div className="dock" ref={dock} onMouseMove={onMove} onMouseLeave={reset}>
      {items.map((it) =>
        it.music ? (
          <button key={it.label} className="dock-item" data-tip={it.label} onClick={() => window.dispatchEvent(new Event("toggle-music"))}>{it.icon}</button>
        ) : it.href ? (
          <a key={it.label} className="dock-item" data-tip={it.label} href={it.href} target="_blank" rel="noreferrer">{it.icon}</a>
        ) : (
          <a key={it.label} className="dock-item" data-tip={it.label} href="#" data-go={it.go}>{it.icon}</a>
        )
      )}
    </div>
  );
}
