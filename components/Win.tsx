"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

let z = 10;

export default function Win({ id, scene, title, children }: { id: string; scene: string; title: string; children: React.ReactNode }) {
  const win = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 800px)").matches) return;
    gsap.registerPlugin(Draggable);
    const [d] = Draggable.create(win.current!, {
      trigger: bar.current!, type: "x,y",
      onPress() { win.current!.parentElement!.style.zIndex = String(++z); },
    });
    return () => d.kill();
  }, []);

  return (
    <section id={id} className={`winwrap ${scene}`}>
      <div ref={win} className="win">
        <div ref={bar} className="titlebar">
          <span className="dots"><i className="r" /><i className="y" /><i className="g" /></span>
          <span className="ttl">{title}</span>
        </div>
        <div className="win-body">{children}</div>
      </div>
    </section>
  );
}
