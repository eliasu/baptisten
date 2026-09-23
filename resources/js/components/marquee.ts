for (const marquee of document.querySelectorAll<HTMLElement>(
  ".marquee_wrap",
)) {
  const toggle = marquee.querySelector<HTMLButtonElement>(
    "[data-marquee-toggle]",
  );
  if (!toggle) continue;

  /* Statamic port: upstream counts the items while rendering; Antlers cannot
     read the slot's markup, so the count is taken from the DOM here. */
  const items = marquee.querySelector(".marquee_panel")?.childElementCount ?? 1;
  marquee.style.setProperty("--_count", String(items));

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const setPlaying = (playing: boolean) => {
    marquee.dataset.state = playing ? "playing" : "paused";
    toggle.setAttribute("aria-pressed", String(playing));
    toggle.setAttribute("aria-label", playing ? "Pause" : "Abspielen");
  };

  /* Anyone who asked for less motion gets it still, and can start it. */
  setPlaying(!reduced.matches);
  reduced.addEventListener("change", () => setPlaying(!reduced.matches));

  toggle.addEventListener("click", () => {
    setPlaying(marquee.dataset.state !== "playing");
  });
}
