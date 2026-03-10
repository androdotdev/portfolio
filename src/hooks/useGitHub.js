import { useState, useEffect } from "react";

export function useGitHub(username) {
  const [data, setData] = useState({
    user: null,
    repos: [],
    events: [],
    loading: true,
    error: null,
    raw: null,
  });

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const gh = (path) =>
          window.fetch(`https://api.github.com${path}`, {
            headers: { Accept: "application/vnd.github+json" },
          });
        const [uRes, rRes, eRes] = await Promise.all([
          gh(`/users/${username}`),
          gh(`/users/${username}/repos?per_page=100&sort=pushed`),
          gh(`/users/${username}/events?per_page=100`),
        ]);
        const raw = {
          uStatus: uRes.status,
          rStatus: rRes.status,
          eStatus: eRes.status,
        };
        const [user, repos, events] = await Promise.all([
          uRes.json(),
          rRes.json(),
          eRes.json(),
        ]);
        if (!cancelled)
          setData({
            user: user?.login ? user : null,
            repos: Array.isArray(repos) ? repos : [],
            events: Array.isArray(events) ? events : [],
            loading: false,
            error: user?.message || null,
            raw,
          });
      } catch (err) {
        if (!cancelled)
          setData((d) => ({ ...d, loading: false, error: err.message }));
      }
    };
    loadAll();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return data;
}
