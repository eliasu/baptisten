const INTERVAL = 6000;
const SLIDE = 500;

for (const tabs of document.querySelectorAll<HTMLElement>(".tabs_wrap")) {
  const links = [...tabs.querySelectorAll<HTMLButtonElement>(".tabs_link")];
  const panelList = tabs.querySelector<HTMLElement>(".tabs_panels");
  const panels = [...(panelList?.children ?? [])] as HTMLElement[];
  if (links.length === 0 || links.length !== panels.length) continue;

  const uid = Math.random().toString(36).slice(2, 8);
  const auto = tabs.classList.contains("auto");
  const toggle = tabs.querySelector<HTMLButtonElement>("[data-toggle]");
  const bar = tabs.querySelector<HTMLElement>(".tabs_links");

  const keepInView = (link: HTMLElement) => {
    if (!bar) return;
    const list = bar.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    if (box.left < list.left) bar.scrollBy({ left: box.left - list.left });
    else if (box.right > list.right)
      bar.scrollBy({ left: box.right - list.right });
  };

  let current = 0;
  let timer: number | undefined;
  let paused = false;

  const key = tabs.id || "tab";
  const slugs = links.map((link) =>
    (link.textContent ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
  );

  const remember = (index: number) => {
    const url = new URL(location.href);
    url.searchParams.set(key, slugs[index]);
    history.replaceState(history.state, "", url);
  };

  links.forEach((link, i) => {
    link.id = `tab-${uid}-${i}`;
    link.setAttribute("role", "tab");
    link.setAttribute("aria-controls", `panel-${uid}-${i}`);
    panels[i].id = `panel-${uid}-${i}`;
    panels[i].setAttribute("role", "tabpanel");
    panels[i].setAttribute("aria-labelledby", link.id);
    panels[i].tabIndex = 0;
  });

  const restart = () => {
    window.clearTimeout(timer);
    if (!auto || paused) return;
    tabs.classList.remove("running");
    void tabs.offsetWidth;
    tabs.classList.add("running");
    timer = window.setTimeout(
      () => show(current + 1, false, false),
      INTERVAL,
    );
  };

  const show = (next: number, focus = false, share = true) => {
    const index = (next + links.length) % links.length;
    if (index !== current) {
      tabs.style.setProperty("--_dir", next > current ? "1" : "-1");
      tabs.dataset.moved = "";
      const leaving = panels[current];
      leaving.classList.add("is-leaving");
      window.setTimeout(
        () => leaving.classList.remove("is-leaving"),
        SLIDE + 50,
      );
    }

    links.forEach((link, i) => {
      link.classList.toggle("is-active", i === index);
      link.setAttribute("aria-selected", String(i === index));
      link.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) =>
      panel.classList.toggle("is-active", i === index),
    );

    current = index;
    if (share) remember(index);
    if (focus) links[index].focus();
    keepInView(links[index]);
    restart();
  };

  links.forEach((link, i) => {
    link.addEventListener("click", () => show(i));
    link.addEventListener("keydown", (event) => {
      const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
      const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
      if (!forward && !back) return;
      event.preventDefault();
      show(current + (forward ? 1 : -1), true);
    });
  });

  for (const step of tabs.querySelectorAll<HTMLButtonElement>(
    "[data-step]",
  )) {
    step.addEventListener("click", () =>
      show(current + Number(step.dataset.step)),
    );
  }

  const setPaused = (value: boolean) => {
    paused = value;
    tabs.classList.toggle("is-paused", value);
    toggle?.setAttribute("aria-pressed", String(!value));
    toggle?.setAttribute(
      "aria-label",
      value ? "Automatischen Wechsel starten" : "Automatischen Wechsel pausieren",
    );
    restart();
  };

  tabs.classList.add("is-ready");

  const wanted = slugs.indexOf(
    new URLSearchParams(location.search).get(key) ?? "",
  );
  show(wanted === -1 ? 0 : wanted, false, false);
  if (wanted !== -1) tabs.scrollIntoView({ block: "nearest" });

  if (!auto) continue;

  toggle?.addEventListener("click", () => {
    holds.asked = false;
    setPaused(!paused);
  });

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const holds = {
    motion: motion.matches,
    focus: false,
    offscreen: false,
    asked: wanted !== -1,
  };
  const settle = () => setPaused(Object.values(holds).some(Boolean));

  motion.addEventListener("change", (event) => {
    holds.motion = event.matches;
    settle();
  });
  tabs.addEventListener("focusin", () => {
    holds.focus = true;
    settle();
  });
  tabs.addEventListener("focusout", (event) => {
    if (tabs.contains(event.relatedTarget as Node)) return;
    holds.focus = false;
    settle();
  });
  new IntersectionObserver((entries) => {
    holds.offscreen = !entries[0].isIntersecting;
    settle();
  }).observe(tabs);

  settle();
}
