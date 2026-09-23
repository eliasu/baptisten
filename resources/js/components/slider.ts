const THRESHOLD = 4;

for (const slider of document.querySelectorAll<HTMLElement>(".slider_wrap")) {
  const list = slider.querySelector<HTMLElement>(".slider_list");
  const markers = slider.querySelector<HTMLElement>(".slider_markers");
  const controls = slider.querySelector<HTMLElement>(".slider_controls");
  const steps = [
    ...slider.querySelectorAll<HTMLButtonElement>("[data-step]"),
  ];
  if (!list) continue;

  const slides = [...list.children] as HTMLElement[];
  if (slides.length === 0) continue;

  slides.forEach((slide, i) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-label", `${i + 1} von ${slides.length}`);
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const behavior = () => (reduced.matches ? "auto" : "smooth");

  const stride = () => {
    const first = slides[0].getBoundingClientRect();
    if (slides.length < 2) return first.width;
    return slides[1].getBoundingClientRect().left - first.left;
  };

  const view = () => {
    const box = getComputedStyle(list);
    return (
      list.clientWidth -
      parseFloat(box.paddingInlineStart) -
      parseFloat(box.paddingInlineEnd)
    );
  };

  const pages = () => {
    const step = stride();
    if (step <= 0) return 1;
    return Math.max(1, slides.length - Math.round(view() / step) + 1);
  };

  const current = () => {
    const step = stride();
    return step > 0 ? Math.round(list.scrollLeft / step) : 0;
  };

  let drawn = 0;

  const draw = (total: number) => {
    if (!markers) return;
    drawn = total;
    markers.replaceChildren(
      ...Array.from({ length: total }, (_, i) => {
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "slider_marker";
        marker.setAttribute("aria-label", `Zu Slide ${i + 1}`);
        marker.addEventListener("click", () =>
          list.scrollTo({ left: i * stride(), behavior: behavior() }),
        );
        return marker;
      }),
    );
  };

  const sync = () => {
    const total = pages();
    if (total !== drawn) draw(total);

    const end = list.scrollWidth - list.clientWidth;
    const atStart = list.scrollLeft <= 1;
    const atEnd = list.scrollLeft >= end - 1;

    for (const step of steps) {
      step.disabled = Number(step.dataset.step) < 0 ? atStart : atEnd;
    }

    const index = current();
    markers?.querySelectorAll(".slider_marker").forEach((marker, i) => {
      marker.classList.toggle("is-active", i === index);
      if (i === index) marker.setAttribute("aria-current", "true");
      else marker.removeAttribute("aria-current");
    });

    controls?.classList.toggle("is-empty", end <= 1);
  };

  for (const step of steps) {
    step.addEventListener("click", () =>
      list.scrollBy({
        left: Number(step.dataset.step) * stride(),
        behavior: behavior(),
      }),
    );
  }

  let origin = 0;
  let from = 0;
  let pressed = false;
  let dragged = false;

  const restore = () => {
    if (!pressed) list.classList.remove("is-dragging");
  };

  list.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    if (list.scrollWidth <= list.clientWidth) return;
    pressed = true;
    dragged = false;
    origin = event.clientX;
    from = list.scrollLeft;
  });

  list.addEventListener("pointermove", (event) => {
    if (!pressed) return;
    const shift = event.clientX - origin;
    if (!dragged) {
      if (Math.abs(shift) < THRESHOLD) return;
      dragged = true;
      list.setPointerCapture(event.pointerId);
      list.classList.add("is-dragging");
    }
    list.scrollLeft = from - shift;
  });

  const release = () => {
    if (!pressed) return;
    pressed = false;
    const step = stride();
    if (dragged && step > 0) {
      list.scrollTo({
        left: Math.round(list.scrollLeft / step) * step,
        behavior: behavior(),
      });
    }
    list.addEventListener("scrollend", restore, { once: true });
    setTimeout(restore, 400);
  };

  list.addEventListener("pointerup", release);
  list.addEventListener("pointercancel", release);
  list.addEventListener("dragstart", (event) => event.preventDefault());

  list.addEventListener(
    "click",
    (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true,
  );

  let frame = 0;
  list.addEventListener(
    "scroll",
    () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    },
    { passive: true },
  );

  slider.classList.add("is-ready");

  const resize = new ResizeObserver(sync);
  resize.observe(list);

  addEventListener("load", sync);
  sync();
}
