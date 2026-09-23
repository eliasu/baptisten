const nav = document.querySelector<HTMLElement>(".nav_wrap");
const toggle = nav?.querySelector<HTMLButtonElement>(".nav_toggle");

if (nav && toggle) {
  const setOpen = (open: boolean) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!nav.classList.contains("open") || !(target instanceof Node)) return;
    if (!nav.contains(target)) setOpen(false);
  });

  window
    .matchMedia("(width >= 48rem)")
    .addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
}
