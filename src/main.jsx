import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/Androsystemconsole.jsx";
import { BlogList, BlogPost } from "./blog/Blog.jsx";

// global reset — prevents white flash/padding on all routes
const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #080d14; overflow-x: hidden; width: 100%; }
  #root { width: 100%; }
`;
document.head.appendChild(globalStyle);

// gh-pages SPA redirect fix
const params = new URLSearchParams(window.location.search);
const redirect = params.get("path");
if (redirect) {
  window.history.replaceState(null, "", redirect);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
