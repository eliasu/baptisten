for (const range of document.querySelectorAll<HTMLElement>(".form-range")) {
  const input = range.querySelector<HTMLInputElement>(".form-range_input");
  const shown = range.querySelector<HTMLElement>(".form-range_value");
  if (!input) continue;

  const update = () => {
    const min = Number(input.min || 0);
    const max = Number(input.max || 100);
    const at = Number(input.value);
    range.style.setProperty(
      "--_progress",
      String(max === min ? 0 : (at - min) / (max - min)),
    );
    if (shown) shown.textContent = input.value;
  };

  input.addEventListener("input", update);
  update();
  range.classList.add("is-drawn");
}
