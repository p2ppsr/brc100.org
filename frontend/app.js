(function () {
  "use strict";
  const catalog = globalThis.BRC_EXAMPLES;
  const state = { example: "identity", view: "typescript" };
  const code = document.getElementById("example-code");
  const message = document.getElementById("example-message");
  const controls = document.getElementById("example-controls");
  const description = document.getElementById("example-description");
  const panel = document.getElementById("code-panel");
  const status = document.getElementById("copy-status");

  function highlight(source) {
    code.replaceChildren();
    const pattern = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(\b(?:import|from|const|await|new|true|false|string|number|boolean|Array|Uint8Array)\b)|(\b\d+\b)/g;
    let last = 0;
    for (const match of source.matchAll(pattern)) {
      code.appendChild(document.createTextNode(source.slice(last, match.index)));
      const token = document.createElement("span");
      token.className = match[1] ? "tok-comment" : match[2] ? "tok-string" : match[3] ? "tok-keyword" : "tok-number";
      token.textContent = match[0];
      code.appendChild(token);
      last = match.index + match[0].length;
    }
    code.appendChild(document.createTextNode(source.slice(last)));
  }

  function render() {
    const example = catalog.examples[state.example];
    document.querySelectorAll("[data-example]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.example === state.example));
    });
    document.querySelectorAll("[data-view]").forEach(function (tab) {
      const selected = tab.dataset.view === state.view;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", "tab-" + state.view);
    document.getElementById("code-filename").textContent = state.view === "typescript" ? "app.ts" : state.view === "request" ? "request.json" : "response.d.ts";
    controls.hidden = !example.editable;
    description.textContent = example.description;
    highlight(catalog.code(state.example, state.view, message.value));
    panel.scrollTop = 0;
    panel.scrollLeft = 0;
    status.textContent = "";
  }

  document.querySelectorAll("[data-example]").forEach(function (button) {
    button.addEventListener("click", function () { state.example = button.dataset.example; render(); });
  });
  const tabs = Array.from(document.querySelectorAll("[data-view]"));
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { state.view = tab.dataset.view; render(); });
    tab.addEventListener("keydown", function (event) {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      state.view = tabs[next].dataset.view;
      render();
      tabs[next].focus();
    });
  });
  message.addEventListener("input", render);

  async function copy(text, feedback) {
    try {
      if (navigator.clipboard && globalThis.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const buffer = document.createElement("textarea");
        buffer.value = text;
        buffer.setAttribute("aria-label", "Code to copy");
        buffer.style.position = "fixed";
        buffer.style.left = "-9999px";
        document.body.appendChild(buffer);
        buffer.select();
        const success = document.execCommand("copy");
        buffer.remove();
        if (!success) throw new Error("Clipboard unavailable");
      }
      feedback();
    } catch (_) {
      status.textContent = "Copy unavailable. Select the code and copy it manually.";
    }
  }

  document.getElementById("copy-code").addEventListener("click", function () {
    const button = this;
    copy(catalog.code(state.example, state.view, message.value), function () {
      status.textContent = "Example copied.";
      button.setAttribute("aria-label", "Example copied");
      button.querySelector("use").setAttribute("href", "#check");
      button.querySelector("span").textContent = "Copied";
      setTimeout(function () {
        button.setAttribute("aria-label", "Copy example code");
        button.querySelector("use").setAttribute("href", "#copy");
        button.querySelector("span").textContent = "Copy";
      }, 1800);
    });
  });
  document.getElementById("copy-install").addEventListener("click", function () {
    const button = this;
    copy("npm install @bsv/sdk", function () {
      status.textContent = "Install command copied.";
      button.setAttribute("aria-label", "Install command copied");
      button.querySelector("use").setAttribute("href", "#check");
      setTimeout(function () {
        button.setAttribute("aria-label", "Copy npm install command");
        button.querySelector("use").setAttribute("href", "#copy");
      }, 1800);
    });
  });

  const flowCalls = {
    identity: "wallet.getPublicKey({ identityKey: true })",
    signature: "wallet.createSignature({ data, protocolID, keyID })",
    transaction: "wallet.createAction({ description, outputs })"
  };
  document.querySelectorAll("[data-flow]").forEach(function (button, index) {
    button.addEventListener("click", function () {
      document.querySelectorAll("[data-flow]").forEach(function (other) {
        other.setAttribute("aria-pressed", String(other === button));
      });
      document.getElementById("diagram-call").textContent = flowCalls[button.dataset.flow];
      document.querySelector(".visual-index").textContent = "0" + (index + 1) + " / 03";
      state.example = button.dataset.flow;
      state.view = "typescript";
      render();
    });
  });

  const menu = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("navigation");
  function closeMenu() {
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  }
  menu.addEventListener("click", function () {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    navigation.classList.toggle("is-open", open);
  });
  navigation.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") { closeMenu(); menu.focus(); }
  });
  globalThis.matchMedia("(min-width: 701px)").addEventListener("change", function (event) {
    if (event.matches) closeMenu();
  });
  render();
})();
