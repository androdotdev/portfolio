import { useState, useEffect } from "react";

export function useStackGraph(repos) {
  const [graph, setGraph] = useState({ nodes: [], edges: [], loading: true });

  useEffect(() => {
    if (!repos || repos.length === 0) return;
    let cancelled = false;

    const loadLangs = async () => {
      try {
        // fetch languages for each repo in parallel (cap at 20 repos)
        const slice = repos.slice(0, 20);
        const results = await Promise.all(
          slice.map((r) =>
            window
              .fetch(
                `https://api.github.com/repos/androdotdev/${r.name}/languages`,
                {
                  headers: { Accept: "application/vnd.github+json" },
                },
              )
              .then((res) => res.json())
              .then((data) => ({ name: r.name, langs: data })),
          ),
        );
        if (cancelled) return;
        const allLanguages = {};
        results.forEach(({ name, langs }) => {
          allLanguages[name] = Array.isArray(langs) ? {} : langs;
        });
        const { nodes, edges } = buildGraphFromRepos(slice, allLanguages);
        setGraph({ nodes, edges, loading: false });
      } catch (err) {
        console.error("stack graph error:", err);
        if (!cancelled) setGraph((g) => ({ ...g, loading: false }));
      }
    };

    loadLangs();
    return () => {
      cancelled = true;
    };
  }, [repos.length]);

  return graph;
}
