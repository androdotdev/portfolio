import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { marked } from "marked";
import "./blog.css";
import PostCard from "./components/PostCard";

// ─── MARKED SETUP ─────────────────────────────────────────────────────────────

marked.use({
  breaks: true,
  gfm: true,
});

const renderer = new marked.Renderer();
renderer.code = (code, lang) => {
  const highlighted =
    window.hljs && lang
      ? window.hljs.highlight(code, { language: lang, ignoreIllegals: true })
          .value
      : code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<pre><code class="hljs language-${lang || ""}">${highlighted}</code></pre>`;
};
marked.use({ renderer });

// ─── FRONTMATTER PARSER ───────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: normalized };
  const meta = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...val] = line.split(":");
    if (key) meta[key.trim()] = val.join(":").trim().replace(/^"|"$/g, "");
  });
  return { meta, content: match[2].trim() };
}

// ─── POST REGISTRY ────────────────────────────────────────────────────────────

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

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function BlogHeader({ showBack }) {
  const navigate = useNavigate();
  return (
    <header className="blog-header">
      <div className="blog-header-left">
        <Link to="/blog" className="blog-wordmark">
          andro<span>/</span>notes
        </Link>
        {showBack && (
          <a
            onClick={() => navigate("/blog")}
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

  useEffect(() => {
    loadAllPosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="blog-root">
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
          <PostCard posts={posts} />
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
    setNotFound(false);
    setPost(null);
    loadPost(slug).then((p) => {
      if (!p) setNotFound(true);
      else setPost(p);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (post && window.hljs) {
      requestAnimationFrame(() => window.hljs.highlightAll());
    }
  }, [post]);

  if (loading)
    return (
      <div className="blog-root">
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
        <BlogHeader showBack />
        <div className="blog-404">
          post not found —{" "}
          <Link to="/blog" style={{ color: "#4da6ff" }}>
            back to notes
          </Link>
        </div>
      </div>
    );

  return (
    <div className="blog-root">
      <BlogHeader showBack />
      <article className="blog-post">
        <h1 className="blog-post-heading">{post.meta.title}</h1>
        <div
          className="blog-post-body"
          dangerouslySetInnerHTML={{ __html: marked(post.content) }}
        />
      </article>
    </div>
  );
}

export { BlogList, BlogPost };
