import Boot from "@/components/Boot";
import Dock from "@/components/Dock";
import Hero from "@/components/Hero";
import MenuBar from "@/components/MenuBar";
import Moon from "@/components/Moon";
import Motion from "@/components/Motion";
import Notch from "@/components/Notch";
import Rain from "@/components/Rain";
import Win from "@/components/Win";

const projects = [
  { name: "Cardfoi", href: "https://cardfoi.vercel.app/", text: "One shareable page for your skills, projects and links. Built to take spiky, read-heavy traffic.", tags: ["Next.js", "Neon", "Drizzle", "Better Auth"] },
  { name: "PostHTML", href: "https://posthtml.vercel.app/", text: "Static HTML hosting with a CLI, an MCP server and a web app.", tags: ["Bun", "Next.js", "Drizzle", "MCP"] },
  { name: "JSON Flow", href: "https://json-flow-client.vercel.app/", text: "A renderer-agnostic JSON diagram compiler. Diagrams as code, with a swappable renderer.", tags: ["Zod", "Cytoscape", "Monaco"] },
  { name: "lyceum", href: "https://lyceum-cli.vercel.app/", text: "A terminal-first Socratic coding tutor that runs a multi-agent LLM pipeline.", tags: ["TypeScript", "Agents", "TUI"] },
  { name: "PollForge", href: "https://pollforge-app.vercel.app/", text: "An online polling app with live results.", tags: ["Next.js", "Vercel"] },
  { name: "CLai", href: "https://chromewebstore.google.com/detail/clai-ai-cover-letters/coihpnhcickicgiklfpbcgehpaaakhoc", text: "A Chrome extension that writes cover letters. Live on the Web Store.", tags: ["Chrome extension"] },
];

export default function Page() {
  return (
    <>
      <Boot />
      <Moon />
      <Rain />
      <Motion />
      <MenuBar />
      <Notch />
      <Dock />
      <div className="dots-nav">
        {["Home", "About", "Work", "Contact"].map((l, i) => (
          <button key={l} data-go={i} aria-label={l} className={i === 0 ? "on" : ""} />
        ))}
      </div>
      <div className="scroll-space" />

      <main className="stage">
        <Hero />

        <Win id="about" scene="w1" title="about.md">
          <p className="about display">
            I am a BCA student at IMS Noida. I pick a hard problem, build the whole thing myself, and ship it. Lately that means <em>backend systems that scale</em>, <em>AI tools</em> and <em>developer tooling</em>.
          </p>
        </Win>

        <Win id="work" scene="w2" title="~/projects">
          <div className="grid">
            {projects.map((p) => (
              <a className="card" key={p.name} href={p.href} target="_blank" rel="noreferrer">
                <h3 className="display">{p.name}</h3>
                <p>{p.text}</p>
                <div className="tags">{p.tags.map((t) => <span key={t}>{t}</span>)}</div>
              </a>
            ))}
          </div>
        </Win>

        <Win id="contact" scene="w3" title="mail">
          <div className="contact">
            <h2 className="display">Got something to build?</h2>
            <a className="mail" href="mailto:rishabhmadhwaldev@gmail.com">rishabhmadhwaldev@gmail.com</a>
            <p className="foot"><a href="https://github.com/androdotdev">GitHub</a> / androdotdev</p>
          </div>
        </Win>
      </main>
    </>
  );
}
