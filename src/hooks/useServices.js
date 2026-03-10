import { useState, useEffect } from "react";

const REAL_REPOS = ["cli-agent", "json-flow", "School-Management"];

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const results = await Promise.all(
          REAL_REPOS.map((name) =>
            Promise.all([
              window
                .fetch(`https://api.github.com/repos/androdotdev/${name}`, {
                  headers: { Accept: "application/vnd.github+json" },
                })
                .then((r) => r.json()),
              window
                .fetch(
                  `https://api.github.com/repos/androdotdev/${name}/languages`,
                  {
                    headers: { Accept: "application/vnd.github+json" },
                  },
                )
                .then((r) => r.json()),
            ]),
          ),
        );

        if (cancelled) return;

        const svcs = results.map(([repo, langs]) => {
          const daysSincePush = Math.floor(
            (Date.now() - new Date(repo.pushed_at)) / 86400000,
          );
          const daysSinceCreate = Math.floor(
            (Date.now() - new Date(repo.created_at)) / 86400000,
          );
          const status = daysSincePush < 30 ? "running" : "experimental";
          const uptimeDays = daysSinceCreate;
          const stack = [
            ...Object.keys(langs || {}).slice(0, 3),
            ...(repo.topics || []).slice(0, 3),
          ].filter(Boolean);

          // simulate cpu/mem/requests for console aesthetic
          const seed = repo.id % 100;
          const cpu = status === "running" ? 10 + (seed % 40) : 0;
          const mem = status === "running" ? 20 + (seed % 50) : 0;
          const reqs =
            status === "running"
              ? repo.stargazers_count * 100 + repo.forks_count * 50 + seed * 7
              : 0;

          return {
            id: repo.name,
            name: repo.name,
            status,
            uptime: status === "running" ? `${uptimeDays}d` : "—",
            version: repo.topics?.find((t) => t.startsWith("v")) || `v—`,
            description: repo.description || "No description provided.",
            stack: stack.length > 0 ? stack : [repo.language].filter(Boolean),
            cpu,
            mem,
            requests: reqs,
            port: null,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            pushed_at: repo.pushed_at,
          };
        });

        setServices(svcs);
      } catch (err) {
        console.error("useServices error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { services, loading };
}
