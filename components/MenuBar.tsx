"use client";
import { useEffect, useState } from "react";
import { LuMoon, LuPower } from "react-icons/lu";

export default function MenuBar() {
  const [now, setNow] = useState("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    setNow(fmt());
    const t = setInterval(() => setNow(fmt()), 20000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="menubar">
      <nav>
        <a href="#" data-go="0" className="logo"><LuMoon /> Andro</a>
        <a href="#" data-go="1">About</a>
        <a href="#" data-go="2">Work</a>
        <a href="#" data-go="3">Contact</a>
      </nav>
      <div className="status"><span>Ghaziabad</span><span>{now}</span>
        <button className="pwr-btn" onClick={() => window.dispatchEvent(new Event("shutdown"))} aria-label="Shut down" title="Shut down"><LuPower /></button></div>
    </header>
  );
}
