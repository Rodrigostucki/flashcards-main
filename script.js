// script.js - gerenciamento de entradas, armazenamento em localStorage, registro do service worker e instalação PWA

const form = document.getElementById("entryForm");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const descInput = document.getElementById("description");
const entriesList = document.getElementById("entriesList");
const emptyMsg = document.getElementById("emptyMsg");
const installBtn = document.getElementById("installBtn");

const STORAGE_KEY = "diario_de_bordo_entries_v1";

// carregar entradas do localStorage
function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Erro ao ler storage", e);
    return [];
  }
}

// salvar entradas
function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// renderizar lista
function render() {
  const entries = loadEntries();
  entriesList.innerHTML = "";
  if (entries.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;
  entries
    .slice()
    .reverse()
    .forEach((entry) => {
      const li = document.createElement("li");
      li.className = "entry";
      li.innerHTML = `
      <div class="meta">
        <h3>${escapeHtml(entry.title)}</h3>
        <time datetime="${entry.date}">${formatDate(entry.date)}</time>
        <p>${escapeHtml(entry.description)}</p>
      </div>
      <div class="actions">
        <button class="small-btn" data-id="${
          entry.id
        }" aria-label="Remover" title="Remover entrada">✕</button>
      </div>
    `;
      entriesList.appendChild(li);
    });

  // attach delete listeners
  Array.from(entriesList.querySelectorAll(".small-btn")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      removeEntry(id);
    });
  });
}

function addEntry(entry) {
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  render();
}

function removeEntry(id) {
  let entries = loadEntries();
  entries = entries.filter((e) => e.id !== id);
  saveEntries(entries);
  render();
}

form.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const title = titleInput.value.trim();
  const date = dateInput.value;
  const description = descInput.value.trim();
  if (!title || !date || !description) {
    alert("Preencha todos os campos.");
    return;
  }
  const entry = {
    id: Date.now().toString(),
    title,
    date,
    description,
  };
  addEntry(entry);
  form.reset();
});

// helper: escape
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
}

// register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("Service Worker registrado"))
    .catch((err) => console.warn("Erro ao registrar SW", err));
}

// PWA install prompt handling
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  if (choice.outcome === "accepted") {
    console.log("Usuário aceitou a instalação");
  } else {
    console.log("Usuário recusou a instalação");
  }
  deferredPrompt = null;
  installBtn.hidden = true;
});

// update UI on load
window.addEventListener("load", render);
