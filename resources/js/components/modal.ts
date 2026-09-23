for (const modal of document.querySelectorAll<HTMLDialogElement>(
  ".modal_wrap",
)) {
  const scroll = modal.querySelector<HTMLElement>("[data-modal-scroll]");

  const open = () => {
    if (modal.open) return;
    if (scroll) scroll.scrollTop = 0;
    modal.showModal();
    modal.dispatchEvent(new CustomEvent("modal-open", { bubbles: true }));
  };

  modal.addEventListener("close", () =>
    modal.dispatchEvent(new CustomEvent("modal-close", { bubbles: true })),
  );

  let fromBackdrop = false;

  modal.addEventListener("mousedown", (event) => {
    fromBackdrop = event.target === modal;
  });

  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-modal-close]")) modal.close();
    else if (fromBackdrop && target === modal) modal.close();
    fromBackdrop = false;
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest(
      `[data-modal-open="${modal.id}"], a[href="#${modal.id}"]`,
    );
    if (!trigger) return;
    event.preventDefault();
    open();
  });

  const url = new URL(location.href);
  if (url.searchParams.get("modal") === modal.id) {
    open();
    url.searchParams.delete("modal");
    history.replaceState(history.state, "", url);
  }
}
