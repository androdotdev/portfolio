import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

// ─── MARKDOWN PARSER (simple, no deps) ───────────────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  const meta = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...val] = line.split(":");
    if (key) meta[key.trim()] = val.join(":").trim().replace(/^"|"$/g, "");
  });
  return { meta, content: match[2].trim() };
}

function markdownToHtml(md) {
  return (
    md
      // code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const highlighted =
          window.hljs && lang
            ? window.hljs.highlight(code.trim(), {
                language: lang,
                ignoreIllegals: true,
              }).value
            : code
                .trim()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      })
      // inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // headings
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      // bold
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // horizontal rule
      .replace(/^---$/gm, "<hr/>")
      // unordered list
      .replace(/^\- (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
      // paragraphs — wrap lines not already wrapped
      .split("\n\n")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (/^<(h[1-6]|ul|pre|hr)/.test(trimmed)) return trimmed;
        return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
      })
      .join("\n")
  );
}

// ─── POST REGISTRY ────────────────────────────────────────────────────────────
// Import all markdown files — add new posts here

// auto-discovers all .md files in posts/ — just drop a file in, no registration needed
const POST_FILES = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
});

function slugFromPath(path) {
  return path.replace("./posts/", "").replace(".md", "");
}

async function loadPost(slug) {
  const entry = Object.entries(POST_FILES).find(
    ([path]) => slugFromPath(path) === slug,
  );
  if (!entry) return null;
  const raw = await entry[1]();
  return parseFrontmatter(raw);
}

async function loadAllPosts() {
  if (Object.keys(POST_FILES).length === 0) return [];
  const posts = await Promise.all(
    Object.entries(POST_FILES).map(async ([path, loader]) => {
      const raw = await loader();
      const slug = slugFromPath(path);
      const { meta, content } = parseFrontmatter(raw);
      const stripped = content
        .replace(/```[\s\S]*?```/g, "")
        .replace(/#+\s/g, "")
        .trim();
      const excerpt =
        stripped.length > 0
          ? stripped.slice(0, 160).trim() + "..."
          : "no content yet.";
      return { slug, title: meta.title || slug, excerpt };
    }),
  );
  return posts;
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const blogCss = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

  .blog-root *, .blog-root *::before, .blog-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  .blog-root {
    min-height: 100vh;
    background: #080d14;
    color: #c9d1e0;
    font-family: 'Lora', Georgia, serif;
  }

  /* header */
  .blog-header {
    border-bottom: 1px solid #1f2d45;
    padding: 0 40px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    background: #080d14;
    z-index: 10;
  }
  .blog-header-left {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .blog-wordmark {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #4da6ff;
    letter-spacing: 0.12em;
    text-decoration: none;
    text-transform: uppercase;
  }
  .blog-wordmark span {
    color: #3de8d4;
  }
  .blog-back {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #3d5070;
    text-decoration: none;
    letter-spacing: 0.06em;
    transition: color 0.15s;
  }
  .blog-back:hover { color: #4da6ff; }

  /* list page */
  .blog-list {
    max-width: 680px;
    margin: 0 auto;
    padding: 60px 20px 80px;
  }
  .blog-list-heading {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #3d5070;
    margin-bottom: 48px;
  }
  .blog-post-item {
    display: block;
    padding: 24px 0;
    border-bottom: 1px solid #111820;
    text-decoration: none;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .blog-post-item:first-of-type { border-top: 1px solid #111820; }
  .blog-post-item:hover .blog-post-title { color: #4da6ff; }
  .blog-post-title {
    font-family: 'Lora', Georgia, serif;
    font-size: 20px;
    font-weight: 600;
    color: #c9d1e0;
    line-height: 1.3;
    margin-bottom: 10px;
    transition: color 0.15s;
  }
  .blog-post-excerpt {
    font-size: 14px;
    color: #4a6080;
    line-height: 1.7;
  }
  .blog-post-arrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #3d5070;
    margin-top: 10px;
    display: block;
  }

  /* post page */
  .blog-post {
    max-width: 680px;
    margin: 0 auto;
    padding: 60px 20px 120px;
  }
  .blog-post-heading {
    font-family: 'Lora', Georgia, serif;
    font-size: 32px;
    font-weight: 600;
    color: #e0e8f0;
    line-height: 1.25;
    margin-bottom: 48px;
    letter-spacing: -0.01em;
  }

  /* post body typography */
  .blog-post-body p {
    font-size: 16px;
    line-height: 1.85;
    color: #8a9ab8;
    margin-bottom: 24px;
  }
  .blog-post-body h1,
  .blog-post-body h2,
  .blog-post-body h3 {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    color: #c9d1e0;
    margin: 40px 0 16px;
    letter-spacing: 0.02em;
  }
  .blog-post-body h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; }
  .blog-post-body h3 { font-size: 13px; color: #4da6ff; }
  .blog-post-body strong { color: #c9d1e0; font-weight: 600; }
  .blog-post-body em { color: #8a9ab8; font-style: italic; }
  .blog-post-body ul {
    margin: 0 0 24px 0;
    padding: 0;
    list-style: none;
  }
  .blog-post-body li {
    font-size: 16px;
    line-height: 1.85;
    color: #8a9ab8;
    padding-left: 20px;
    position: relative;
    margin-bottom: 6px;
  }
  .blog-post-body li::before {
    content: "—";
    position: absolute;
    left: 0;
    color: #1f2d45;
  }
  .blog-post-body code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #3de8d4;
    background: #0d1a2e;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid #1f2d45;
  }
  .blog-post-body pre {
    background: #0a0f18;
    border: 1px solid #1f2d45;
    border-left: 3px solid #4da6ff;
    border-radius: 4px;
    padding: 20px;
    overflow-x: auto;
    margin: 24px 0;
  }
  .blog-post-body pre code {
    background: none;
    border: none;
    padding: 0;
    color: #c9d1e0;
    font-size: 13px;
    line-height: 1.7;
  }
  .blog-post-body hr {
    border: none;
    border-top: 1px solid #111820;
    margin: 40px 0;
  }

  /* 404 */
  .blog-404 {
    max-width: 680px;
    margin: 80px auto;
    padding: 0 20px;
    font-family: 'JetBrains Mono', monospace;
    color: #3d5070;
    font-size: 12px;
  }

  /* responsive */
  @media (max-width: 600px) {
    .blog-header { padding: 0 16px; }
    .blog-list { padding: 40px 16px 60px; }
    .blog-post { padding: 40px 16px 80px; }
    .blog-post-heading { font-size: 24px; }
    .blog-post-body p { font-size: 15px; }
  }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function BlogHeader({ showBack }) {
  const navigate = useNavigate();
  return (
    <header className="blog-header">
      <div className="blog-header-left">
        <Link to="/blogs" className="blog-wordmark">
          andro<span>/</span>notes
        </Link>
        {showBack && (
          <a
            onClick={() => navigate("/blogs")}
            className="blog-back"
            style={{ cursor: "pointer" }}
          >
            ← all posts
          </a>
        )}
      </div>
      <Link to="/" className="blog-back">
        ← console
      </Link>
    </header>
  );
}

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAllPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="blog-root">
      <style>{blogCss}</style>
      <BlogHeader showBack={false} />
      <div className="blog-list">
        <div className="blog-list-heading">// notes & writing</div>
        {loading ? (
          <div
            style={{
              color: "#3d5070",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
            }}
          >
            loading...
          </div>
        ) : posts.length === 0 ? (
          <div
            style={{
              padding: "60px 0",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              color: "#3d5070",
              lineHeight: 2,
            }}
          >
            <div style={{ marginBottom: 8 }}>// no posts yet</div>
            <div>
              drop a <span style={{ color: "#4da6ff" }}>.md</span> file into{" "}
              <span style={{ color: "#4da6ff" }}>src/blog/posts/</span> to get
              started
            </div>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.slug}
              className="blog-post-item"
              onClick={() => navigate(`/blogs/${post.slug}`)}
            >
              <div className="blog-post-title">{post.title}</div>
              <div className="blog-post-excerpt">{post.excerpt}</div>
              <span className="blog-post-arrow">read →</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    loadPost(slug).then((p) => {
      if (!p) setNotFound(true);
      else setPost(p);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    // re-run highlight.js after content renders
    if (post && window.hljs) {
      window.hljs.highlightAll();
    }
  }, [post]);

  if (loading)
    return (
      <div className="blog-root">
        <style>{blogCss}</style>
        <BlogHeader showBack />
        <div
          className="blog-post"
          style={{
            color: "#3d5070",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
          }}
        >
          loading...
        </div>
      </div>
    );

  if (notFound)
    return (
      <div className="blog-root">
        <style>{blogCss}</style>
        <BlogHeader showBack />
        <div className="blog-404">
          post not found —{" "}
          <Link to="/blogs" style={{ color: "#4da6ff" }}>
            back to notes
          </Link>
        </div>
      </div>
    );

  return (
    <div className="blog-root">
      <style>{blogCss}</style>
      <BlogHeader showBack />
      <article className="blog-post">
        <h1 className="blog-post-heading">{post.meta.title}</h1>
        <div
          className="blog-post-body"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />
      </article>
    </div>
  );
}

export { BlogList, BlogPost };
