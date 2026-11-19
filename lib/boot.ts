// Runs fn once the boot screen has finished. With repeat, it runs on every later boot too.
export function whenBooted(fn: () => void, repeat = false) {
  const done = document.documentElement.dataset.boot === "done";
  if (done) fn();
  if (done && !repeat) return () => {};
  const h = () => fn();
  window.addEventListener("boot-done", h, { once: !repeat });
  return () => window.removeEventListener("boot-done", h);
}
