/**
 * Dynamically update page meta tags for SEO + Open Graph
 * Call this at the top of any page component
 */
export function setMeta({ title, description, url }) {
  const base = "EduChain — Decentralized Academic Credentials";

  document.title = title ? `${title} | ${base}` : base;

  const setMeta = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`) ||
             document.querySelector(`meta[property="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(name.startsWith("og:") ? "property" : "name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  if (description) {
    setMeta("description",       description);
    setMeta("og:description",    description);
    setMeta("twitter:description", description);
  }

  setMeta("og:title",    title || base);
  setMeta("og:type",     "website");
  setMeta("og:url",      url || window.location.href);
  setMeta("og:image",    "/og-image.png");
  setMeta("twitter:card","summary_large_image");
}
