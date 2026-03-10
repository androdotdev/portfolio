import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { animate, stagger } from "animejs";

export default function PostCard({ posts }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".post-card");
    if (!cards.length) return;

    animate(cards, {
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 400,
      delay: stagger(60, { start: 80 }),
      easing: "easeOutQuart",
    });
  }, [posts]);

  return (
    <div ref={containerRef} className="post-card-list">
      {posts.map((post, i) => (
        <div
          key={post.slug}
          className="post-card"
          onClick={() => navigate(`/blog/${post.slug}`)}
        >
          <div className="post-card-index">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="post-card-body">
            <div className="post-card-title">{post.title}</div>
            <div className="post-card-excerpt">{post.excerpt}</div>
          </div>
          <div className="post-card-arrow">→</div>
        </div>
      ))}
    </div>
  );
}
