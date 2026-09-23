for (const form of document.querySelectorAll<HTMLElement>(".form_wrap")) {
  const fields = form.querySelector<HTMLFormElement>(".form_fields");
  if (!fields) continue;

  const submit = fields.querySelector<HTMLButtonElement | HTMLInputElement>(
    'button:not([type]), button[type="submit"], input[type="submit"]',
  );

  fields.addEventListener("submit", async (event) => {
    /* Statamic port: the endpoint is the action `{{ form:create }}` renders,
       not a data attribute on the wrapper. */
    const endpoint = form.dataset.endpoint ?? fields.getAttribute("action");

    if (!fields.checkValidity()) return;

    event.preventDefault();
    form.dataset.state = "sending";
    if (submit) submit.disabled = true;

    try {
      if (endpoint) {
        const answer = await fetch(endpoint, {
          method: fields.method || "post",
          body: new FormData(fields),
          headers: { Accept: "application/json" },
        });
        if (!answer.ok) throw new Error(String(answer.status));
      }
      form.dataset.state = "sent";
      fields.reset();
    } catch {
      form.dataset.state = "failed";
      if (submit) submit.disabled = false;
    }
  });
}
