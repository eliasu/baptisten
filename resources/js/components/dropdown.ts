for (const dropdown of document.querySelectorAll<HTMLDetailsElement>(
  ".dropdown_wrap",
)) {
  const summary = dropdown.querySelector<HTMLElement>(".dropdown_toggle");
  const content = dropdown.querySelector<HTMLElement>(".dropdown_content");
  if (!summary || !content) continue;

  document.addEventListener("keydown", (event) => {
    if (!dropdown.open) return;

    if (event.key === "Escape") {
      dropdown.open = false;
      summary.focus();
      return;
    }

    const forward = event.key === "ArrowDown";
    if (!forward && event.key !== "ArrowUp") return;
    if (!dropdown.contains(document.activeElement)) return;

    const items = [
      ...content.querySelectorAll<HTMLElement>(
        "a[href], button:not(:disabled)",
      ),
    ];
    if (items.length === 0) return;

    event.preventDefault();
    const from = items.indexOf(document.activeElement as HTMLElement);
    const step = forward ? 1 : -1;
    const next =
      from === -1
        ? forward
          ? 0
          : items.length - 1
        : (from + step + items.length) % items.length;
    items[next].focus();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!dropdown.open || !(target instanceof Node)) return;
    if (!dropdown.contains(target)) dropdown.open = false;
  });
}
