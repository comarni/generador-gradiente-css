// Conversor de Texto Online - JavaScript modular y reutilizable
(() => {
  const textInput = document.getElementById("textInput");
  const charCount = document.getElementById("charCount");
  const wordCount = document.getElementById("wordCount");
  const actions = document.querySelector(".actions");
  const themeToggle = document.getElementById("themeToggle");
  const toast = document.getElementById("toast");

  const actionMap = {
    uppercase: (value) => value.toUpperCase(),
    lowercase: (value) => value.toLowerCase(),
    titlecase: toTitleCase,
    "remove-special": removeAccentsAndSpecials,
    slug: toSlug,
  };

  init();

  function init() {
    applySavedTheme();
    updateStats();

    textInput.addEventListener("input", updateStats);

    actions.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const action = button.dataset.action;

      if (action === "copy") {
        await copyText();
        return;
      }

      if (action === "clear") {
        clearText();
        return;
      }

      transformText(action);
    });

    themeToggle.addEventListener("click", toggleTheme);
  }

  function transformText(action) {
    const inputText = textInput.value;

    if (!validateInput(inputText)) return;

    const transformer = actionMap[action];
    if (!transformer) return;

    textInput.value = transformer(inputText);
    updateStats();
    showToast("Texto convertido correctamente", false);
  }

  function validateInput(value) {
    if (value.trim().length > 0) {
      textInput.classList.remove("input-error");
      return true;
    }

    textInput.classList.add("input-error");
    showToast("Escribe texto antes de convertir", true);
    textInput.focus();

    window.setTimeout(() => textInput.classList.remove("input-error"), 1200);
    return false;
  }

  function updateStats() {
    const raw = textInput.value;
    charCount.textContent = raw.length.toString();
    wordCount.textContent = countWords(raw).toString();
  }

  function countWords(value) {
    const clean = value.trim();
    if (!clean) return 0;
    return clean.split(/\s+/).length;
  }

  function toTitleCase(value) {
    return value
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function removeAccents(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function removeAccentsAndSpecials(value) {
    const noAccents = removeAccents(value);
    return noAccents.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
  }

  function toSlug(value) {
    return removeAccents(value)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function copyText() {
    const value = textInput.value;
    if (!validateInput(value)) return;

    try {
      await navigator.clipboard.writeText(value);
      showToast("Texto copiado al portapapeles", false);
    } catch (error) {
      showToast("No se pudo copiar automaticamente", true);
    }
  }

  function clearText() {
    textInput.value = "";
    updateStats();
    textInput.focus();
    showToast("Texto limpiado", false);
  }

  function showToast(message, isError) {
    toast.textContent = message;
    toast.className = `toast show${isError ? " error" : ""}`;

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("show", "error");
    }, 1700);
  }

  function applySavedTheme() {
    const saved = localStorage.getItem("tt_theme");
    // Dark mode is default. Only force light mode if user chose it before.
    if (saved === "light") {
      document.body.classList.remove("dark-mode");
      return;
    }
    document.body.classList.add("dark-mode");
  }

  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("tt_theme", isDark ? "dark" : "light");
  }
})();

// Build note: minify this file with terser/esbuild before deployment
