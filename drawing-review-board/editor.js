const PROJECTS_KEY = "samcho-board-projects-v2";
const ACTIVE_PROJECT_KEY = "samcho-board-active-project-v2";
const ACTIVE_BOARD_KEY = "samcho-board-active-board-v1";
const MATERIAL_LIBRARY_KEY = "samcho-board-material-library-v1";
const LINK_LIBRARY_KEY = "samcho-board-link-library-v1";
const LAYOUT_LIBRARY_KEY = "samcho-board-layout-library-v1";
const REFERENCE_BOARDS_KEY = "samcho-board-reference-boards-v1";
const PANEL_LOGO_KEY = "samcho-board-panel-logo-v1";
const COMPANY_WEBSITE_KEY = "samcho-board-company-website-v1";
const MEMO_DRAFT_KEY = "samcho-board-memo-draft-v1";
const THEME_KEY = "samcho-board-theme-v1";
const IMAGE_MAX_EDGE = 1800;
const IMAGE_QUALITY = 0.86;
const EXPORT_VERSION = 2;
const LEGACY_BOARD_NAMES = new Set(["자재 제안서", "이미지 제안서", "제품 제안서", "현장 특이사항"]);

const sampleImages = {
  oak: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=900&q=80",
  kitchen: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
  stone: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=900&q=80",
  tile: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  bath: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80",
  light: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
  door: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  fabric: "https://images.unsplash.com/photo-1582582494700-0480d6e5ccaf?auto=format&fit=crop&w=900&q=80",
};

const BOARD_TYPES = {
  material: {
    id: "material",
    label: "Material",
    eyebrow: "Material Detail",
    sampleEyebrow: "Selected Material",
    addLabel: "Add material",
    saveLabel: "Save material",
    nameLabel: "Material name",
    categoryLabel: "Category",
    brandLabel: "Brand",
    codeLabel: "Code",
    cautionLabel: "Notes",
    specLabel: "Specification memo",
    defaultName: "New material",
    defaultLabel: "Material",
    defaultCategory: "Finish",
    defaultNote: "",
    defaultCaution: "",
    defaultSpec: "",
  },
  image: {
    id: "image",
    label: "Image",
    eyebrow: "Image Proposal",
    sampleEyebrow: "Selected Image",
    addLabel: "Add image",
    saveLabel: "Save image",
    nameLabel: "Image title",
    categoryLabel: "Space / theme",
    brandLabel: "Source",
    codeLabel: "Reference no.",
    cautionLabel: "Proposal memo",
    specLabel: "Proposal memo",
    defaultName: "New image",
    defaultLabel: "Image",
    defaultCategory: "Mood image",
    defaultNote: "",
    defaultCaution: "",
    defaultSpec: "",
  },
  product: {
    id: "product",
    label: "Product",
    eyebrow: "Product Proposal",
    sampleEyebrow: "Selected Product",
    addLabel: "Add product",
    saveLabel: "Save product",
    nameLabel: "Product name",
    categoryLabel: "Product type",
    brandLabel: "Brand",
    codeLabel: "Model",
    cautionLabel: "Checklist",
    specLabel: "Product memo",
    defaultName: "New product",
    defaultLabel: "Product",
    defaultCategory: "Product",
    defaultNote: "",
    defaultCaution: "",
    defaultSpec: "",
  },
  note: {
    id: "note",
    label: "Note",
    eyebrow: "Board Note",
    sampleEyebrow: "Selected Note",
    addLabel: "Add note",
    saveLabel: "Save note",
    nameLabel: "Note title",
    categoryLabel: "Note type",
    brandLabel: "Author",
    codeLabel: "Reference",
    cautionLabel: "Note",
    specLabel: "Memo detail",
    defaultName: "Meeting memo",
    defaultLabel: "Memo",
    defaultCategory: "Meeting",
    defaultNote: "",
    defaultCaution: "",
    defaultSpec: "",
  },
};

const starterItems = [];

const defaultProjects = [
  {
    id: "project-sample",
    name: "New Project",
    client: "Client",
    site: "Site information",
    boards: [
      {
        id: "board-sample-material",
        name: "Board 1",
        meeting: "Proposal meeting",
        date: new Date().toLocaleDateString("ko-KR"),
        status: "Draft",
        references: [],
        items: starterItems,
      },
    ],
  },
];

const defaultReferenceBoards = [];
const defaultBoardReferences = [];
const defaultPanelLogo = "./assets/DLOGO.png";
const companyLogoLight = "./assets/DLOGO.png";
const companyLogoDark = "./assets/yeskim-dark-panel-logo.png";
const companyAddress = "YESKIM Drawing Review · Private design board system";
const brandVector = `
  <svg class="canvas-vector-mark" viewBox="0 0 64 64" aria-hidden="true">
    <path d="M13 13h17c13.6 0 21 7.5 21 19s-7.4 19-21 19H13V13Zm10.5 28.5H30c7.2 0 10.8-3.6 10.8-9.5S37.2 22.5 30 22.5h-6.5v19Z"></path>
    <path d="M13 54h38"></path>
  </svg>
`;

let projects = loadProjects();
let activeProjectId = localStorage.getItem(ACTIVE_PROJECT_KEY) || projects[0].id;
let activeBoardId = localStorage.getItem(ACTIVE_BOARD_KEY) || getActiveProject().boards[0]?.id || null;
let activeItemId = getActiveBoard().items[0]?.id || null;
let activeTab = "spec";
let mode = "designer";
let dragState = null;
let editingNoteId = null;
let lastNotePointer = { id: "", time: 0 };
let pasteAnchor = { x: 50, y: 50 };
let referenceBoards = loadReferenceBoards();
let panelLogo = loadPanelLogo();
let companyWebsite = loadCompanyWebsite();
let memoDraft = localStorage.getItem(MEMO_DRAFT_KEY) || "";
let theme = localStorage.getItem(THEME_KEY) || "light";

const appShell = document.querySelector(".app-shell");
const canvas = document.querySelector("#sampleCanvas");
const panel = document.querySelector("#choicePanel");
const drawer = document.querySelector("#drawerContent");
const boardReferenceList = document.querySelector("#boardReferenceList");
const projectSelect = document.querySelector("#projectSelect");
const boardSelect = document.querySelector("#boardSelect");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const openSlotCount = document.querySelector("#openSlotCount");
const toast = document.querySelector("#toast");
const nameModal = document.querySelector("#nameModal");
const nameModalEyebrow = document.querySelector("#nameModalEyebrow");
const nameModalTitle = document.querySelector("#nameModalTitle");
const nameModalDescription = document.querySelector("#nameModalDescription");
const nameModalLabel = document.querySelector("#nameModalLabel");
const nameModalInput = document.querySelector("#nameModalInput");
const nameModalError = document.querySelector("#nameModalError");
const nameModalConfirm = document.querySelector("#nameModalConfirm");

let nameDialogAction = null;

applyTheme();

function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECTS_KEY));
    return normalizeProjects(Array.isArray(saved) && saved.length ? saved : structuredClone(defaultProjects));
  } catch {
    return normalizeProjects(structuredClone(defaultProjects));
  }
}

function normalizeProjects(projectList) {
  return projectList.map(normalizeProject);
}

function normalizeProject(project) {
  const legacyItems = Array.isArray(project.items) ? project.items : null;
  const boards = Array.isArray(project.boards) && project.boards.length
    ? project.boards
    : [
        {
          id: `board-${project.id || Date.now()}`,
          name: inferBoardName(project.name),
          meeting: project.meeting || "Proposal meeting",
          date: project.date || new Date().toLocaleDateString("ko-KR"),
          status: project.status || "Draft",
          references: defaultBoardReferences.map((src, index) => createReferenceEntry(src, `Reference ${index + 1}`)),
          items: legacyItems || [],
        },
      ];

  return {
    id: project.id,
    name: project.name,
    client: project.client || project.name || "Client",
    site: project.site || "Site information",
    boards: boards.map((board, index) => normalizeBoard(board, index)),
  };
}

function normalizeBoard(board, index = 0) {
  const boardName = LEGACY_BOARD_NAMES.has(board.name) ? `Board ${index + 1}` : board.name;
  return {
    id: board.id || `board-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: boardName || `Board ${index + 1}`,
    meeting: board.meeting || "Proposal meeting",
    date: board.date || new Date().toLocaleDateString("ko-KR"),
    status: board.status || "Draft",
    references: Array.isArray(board.references)
      ? board.references.map((reference, referenceIndex) => normalizeReference(reference, referenceIndex))
      : defaultBoardReferences.map((src, referenceIndex) => createReferenceEntry(src, `Reference ${referenceIndex + 1}`)),
    items: Array.isArray(board.items) ? board.items.map(normalizeItem) : [],
  };
}

function createReferenceEntry(src, title = "Reference") {
  return {
    id: `reference-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    src,
    createdAt: new Date().toISOString(),
  };
}

function normalizeReference(reference, index = 0) {
  if (typeof reference === "string") return createReferenceEntry(reference, `Reference ${index + 1}`);
  return {
    id: reference.id || `reference-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: reference.title || `Reference ${index + 1}`,
    src: reference.src || reference.image || "",
    createdAt: reference.createdAt || new Date().toISOString(),
  };
}

function inferBoardName(projectName = "") {
  const match = String(projectName).match(/[-–—]\s*(.+)$/);
  return match?.[1]?.trim() || "Board 1";
}

function normalizeItem(item) {
  const type = getBoardType(item);
  const normalized = {
    ...createDefaultItem(type.id),
    ...item,
    boardType: item.boardType || type.id,
  };
  if (normalized.label === normalized.name && normalized.name === type.defaultName) {
    normalized.label = type.defaultLabel;
  }
  return normalized;
}

function saveProjects(showMessage = false) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    localStorage.setItem(ACTIVE_BOARD_KEY, activeBoardId || "");
    if (showMessage) showToast("Workspace saved.");
    return true;
  } catch (error) {
    console.error("Workspace save failed.", error);
    showToast("Created, but local storage is full. Export or delete heavy images.");
    return false;
  }
}

function loadMaterialLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(MATERIAL_LIBRARY_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveMaterialLibrary(library) {
  localStorage.setItem(MATERIAL_LIBRARY_KEY, JSON.stringify(library));
}

function loadLinkLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(LINK_LIBRARY_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveLinkLibrary(library) {
  localStorage.setItem(LINK_LIBRARY_KEY, JSON.stringify(library));
}

function loadLayoutLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(LAYOUT_LIBRARY_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveLayoutLibrary(library) {
  localStorage.setItem(LAYOUT_LIBRARY_KEY, JSON.stringify(library));
}

function loadReferenceBoards() {
  try {
    const saved = JSON.parse(localStorage.getItem(REFERENCE_BOARDS_KEY));
    return Array.isArray(saved) && saved.length
      ? defaultReferenceBoards.map((src, index) => saved[index] || src)
      : [...defaultReferenceBoards];
  } catch {
    return [...defaultReferenceBoards];
  }
}

function saveReferenceBoards(boards = referenceBoards) {
  localStorage.setItem(REFERENCE_BOARDS_KEY, JSON.stringify(boards));
}

function loadPanelLogo() {
  const savedLogo = localStorage.getItem(PANEL_LOGO_KEY);
  return savedLogo && !savedLogo.includes("yeskim-logo.svg") ? savedLogo : defaultPanelLogo;
}

function savePanelLogo(logo = panelLogo) {
  localStorage.setItem(PANEL_LOGO_KEY, logo);
}

function loadCompanyWebsite() {
  return localStorage.getItem(COMPANY_WEBSITE_KEY) || "";
}

function saveCompanyWebsite(url = companyWebsite) {
  localStorage.setItem(COMPANY_WEBSITE_KEY, url);
}
function renderCompanyCard() {
  return `
    <div class="company-card">
      <img src="${getCompanyLogo()}" alt="YESKIM Drawing Review">
      <p>${companyAddress}</p>
      <div class="company-actions">
        <button class="secondary-button" type="button" data-open-company-site>
          <span class="material-symbols-outlined">language</span> Website
        </button>
      </div>
      <label class="company-url-field designer-only">Homepage URL
        <input data-company-website value="${escapeAttr(companyWebsite)}" placeholder="https://">
      </label>
      <div class="memo-pad designer-only">
        <label>Board memo
          <textarea data-board-memo placeholder="Write a meeting memo.">${escapeHtml(memoDraft)}</textarea>
        </label>
        <button class="secondary-button" type="button" id="addBoardMemo">
          <span class="material-symbols-outlined">sticky_note_2</span> Add memo to board
        </button>
      </div>
    </div>
  `;
}

function renderLibraryPreview() {
  const library = loadMaterialLibrary();
  if (!library.length) {
    return `<p class="library-empty">No saved library items yet.</p>`;
  }
  const sortedLibrary = [...library].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  return `
    <div class="library-list">
      ${sortedLibrary
        .slice(0, 5)
        .map(
          (material) => `
            <div class="library-row ${material.pinned ? "is-pinned" : ""}">
              <button class="library-item" type="button" data-library-load="${material.id}">
                ${material.image ? `<img src="${material.image}" alt="">` : `<span class="library-thumb"></span>`}
                <span>
                  <strong>${material.label || material.name}</strong>
                  <small>${material.pinned ? "Pinned" : "Saved asset"}</small>
                </span>
              </button>
              <button class="library-pin" type="button" data-library-pin="${material.id}" aria-label="${material.pinned ? "Unpin" : "Pin"} ${escapeAttr(material.label || material.name)}">
                <span class="material-symbols-outlined">${material.pinned ? "keep_off" : "keep"}</span>
              </button>
              <button class="library-delete" type="button" data-library-delete="${material.id}" aria-label="Delete ${escapeAttr(material.label || material.name)}"><span class="material-symbols-outlined">delete</span></button>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function getActiveProject() {
  return projects.find((project) => project.id === activeProjectId) || projects[0];
}

function getActiveBoard() {
  const project = getActiveProject();
  const board = project.boards.find((entry) => entry.id === activeBoardId) || project.boards[0];
  activeBoardId = board?.id || null;
  return board || { id: null, name: "Board", meeting: "Proposal meeting", date: "", status: "Draft", references: [], items: [] };
}

function getActiveItem() {
  const board = getActiveBoard();
  return board.items.find((item) => item.id === activeItemId) || board.items[0] || null;
}

function getBoardType(itemOrType = "material") {
  const typeId = typeof itemOrType === "string" ? itemOrType : itemOrType?.boardType;
  return BOARD_TYPES[typeId] || BOARD_TYPES.material;
}

function createDefaultItem(typeId = "material") {
  const type = getBoardType(typeId);
  return {
    boardType: type.id,
    name: type.defaultName,
    label: type.defaultLabel,
    category: type.defaultCategory,
    brand: "",
    code: "",
    image: "",
    linkId: "",
    linkTitle: "",
    linkUrl: "",
    sourcePath: "",
    note: type.defaultNote,
    caution: type.defaultCaution,
    spec: type.defaultSpec,
  };
}

function renderBoardTypeOptions(activeTypeId) {
  return Object.values(BOARD_TYPES)
    .map((type) => `<option value="${type.id}" ${type.id === activeTypeId ? "selected" : ""}>${type.label}</option>`)
    .join("");
}

function getItemLinkLabel(item = getActiveItem()) {
  if (!item?.linkUrl) return "No link connected";
  const libraryLink = loadLinkLibrary().find((link) => link.id === item.linkId);
  return libraryLink?.title || item.linkTitle || item.linkUrl;
}

function updateProject(updater, persist = true) {
  projects = projects.map((project) => (project.id === activeProjectId ? updater(project) : project));
  if (persist) saveProjects();
}

function updateBoard(updater, persist = true) {
  updateProject(
    (project) => ({
      ...project,
      boards: project.boards.map((board) => (board.id === activeBoardId ? updater(board) : board)),
    }),
    persist
  );
}

function updateItem(itemId, patch, persist = true) {
  updateBoard((board) => ({
    ...board,
    items: board.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
  }), persist);
}

function focusEditingNote() {
  if (!editingNoteId) return;
  const note = document.querySelector(`[data-note-edit="${editingNoteId}"]`);
  if (!note) return;
  note.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(note);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function startNoteEdit(itemId) {
  const item = getActiveBoard().items.find((entry) => entry.id === itemId);
  if (!item || getBoardType(item).id !== "note") return;
  activeItemId = itemId;
  editingNoteId = itemId;
  render();
  requestAnimationFrame(focusEditingNote);
}

function stopNoteEdit({ renderPanelOnly = false } = {}) {
  if (!editingNoteId) return;
  editingNoteId = null;
  saveProjects();
  if (renderPanelOnly) {
    renderPanel();
    renderDrawer();
    return;
  }
  render();
}

function applyItemVisual(itemId) {
  const item = getActiveBoard().items.find((entry) => entry.id === itemId);
  const element = document.querySelector(`[data-item="${itemId}"]`);
  if (!item || !element) return;
  element.style.left = `${item.x}%`;
  element.style.top = `${item.y}%`;
  element.style.width = `${item.w}%`;
  element.style.height = `${item.h}%`;
  element.style.zIndex = item.z;
  element.style.setProperty("--r", `${item.rotate}deg`);
}

function render() {
  const project = getActiveProject();
  const board = getActiveBoard();
  appShell.classList.toggle("client-mode", mode === "client");
  document.querySelector("#boardTitle").textContent = `${project.name} · ${board.name}`;
  document.querySelector(".paper-meta").innerHTML = `
    <span>YESKIM Drawing Review</span>
    <span>${board.name}</span>
    <span>${board.date}</span>
  `;

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === activeTab);
  });

  renderProjectSelect();
  renderBoardSelect();
  renderProgress();
  renderBoardReferences();
  renderCanvas();
  renderPanel();
  renderDrawer();
}

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  const button = document.querySelector("#themeToggle .material-symbols-outlined");
  if (button) button.textContent = theme === "dark" ? "light_mode" : "dark_mode";
  const brandLogo = document.querySelector(".brand-vector");
  if (brandLogo) {
    brandLogo.src = theme === "dark" ? brandLogo.dataset.logoDark : brandLogo.dataset.logoLight;
  }
}

function getCompanyLogo() {
  return theme === "dark" ? companyLogoDark : companyLogoLight;
}

function toggleTheme() {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
  renderPanel();
}

function renderProjectSelect() {
  projectSelect.innerHTML = projects
    .map((project) => `<option value="${project.id}" title="${escapeAttr(project.name)}" ${project.id === activeProjectId ? "selected" : ""}>${project.name}</option>`)
    .join("");
}

function renderBoardSelect() {
  const boards = getActiveProject().boards;
  boardSelect.innerHTML = boards
    .map((board) => `<option value="${board.id}" ${board.id === activeBoardId ? "selected" : ""}>${board.name}</option>`)
    .join("");
}

function getSuggestedProjectName() {
  return `New project ${projects.length + 1}`;
}

function getSuggestedBoardName() {
  return `Board ${getActiveProject().boards.length + 1}`;
}

function renderProgress() {
  const board = getActiveBoard();
  progressText.textContent = board.status;
  progressBar.style.width = "0%";
  openSlotCount.textContent = `${board.status}`;
}

function renderBoardReferences() {
  if (!boardReferenceList) return;
  const references = getActiveBoard().references || [];
  boardReferenceList.innerHTML = references.length
    ? references
        .map((reference) => `
          <article class="board-reference-card">
            <button class="board-reference-thumb" type="button" data-reference-preview="${reference.id}" aria-label="Preview ${escapeAttr(reference.title)}">
              <img src="${reference.src}" alt="${escapeAttr(reference.title)}">
            </button>
            <div>
              <strong>${escapeHtml(reference.title)}</strong>
              <button class="secondary-button icon-button" type="button" data-reference-delete="${reference.id}" aria-label="Delete reference" title="Delete reference">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </article>
        `)
        .join("")
    : `<p class="reference-empty">Add a reference board for this canvas.</p>`;
}
function renderCanvas() {
  const board = getActiveBoard();
  const items = board.items
    .slice()
    .sort((a, b) => a.z - b.z)
    .map((item) => {
      const type = getBoardType(item);
      const isNote = type.id === "note";
      const isEditingNote = editingNoteId === item.id;
      const activeClass = item.id === activeItemId ? "is-active" : "";
      const style = `left:${item.x}%;top:${item.y}%;width:${item.w}%;height:${item.h}%;z-index:${item.z};--r:${item.rotate}deg;`;
      return `
        <article class="board-slot is-filled free-item type-${type.id} ${activeClass} ${isEditingNote ? "is-editing-note" : ""}" data-item="${item.id}" style="${style}" aria-label="${item.label}">
          ${
            isNote
              ? `
                <div
                  class="board-note-text"
                  data-note-edit="${item.id}"
                  contenteditable="${isEditingNote ? "true" : "false"}"
                  spellcheck="false"
                  role="textbox"
                  aria-label="Edit note"
                  data-placeholder="Memo"
                >${escapeHtml(item.note || item.label || "Memo")}</div>
              `
              : item.image
                ? `<img src="${item.image}" alt="${item.name} image" draggable="false">`
                : `<div class="blank-material"><button type="button" data-upload-item="${item.id}" aria-label="Add image"><span class="material-symbols-outlined">add_photo_alternate</span></button></div>`
          }
          ${
            isNote
              ? ""
              : `
                <div class="item-meta">
                  ${item.label ? `<strong>${escapeHtml(item.label)}</strong>` : ""}
                  ${item.note ? `<span>${escapeHtml(item.note)}</span>` : ""}
                </div>
                <button class="item-image-button designer-only" type="button" data-upload-item="${item.id}" aria-label="Change image"><span class="material-symbols-outlined">add_photo_alternate</span></button>
              `
          }
          ${item.linkUrl ? `<button class="item-link-button" type="button" data-open-link="${item.id}" aria-label="Open link"><span class="material-symbols-outlined">open_in_new</span></button>` : ""}
          ${
            isNote
              ? ""
              : `
                <button class="rotate-handle designer-only" type="button" data-rotate="${item.id}" aria-label="Rotate"><span class="material-symbols-outlined">rotate_right</span></button>
                <button class="resize-handle designer-only" type="button" data-resize="${item.id}" aria-label="Resize"><span class="material-symbols-outlined">open_in_full</span></button>
              `
          }
        </article>
      `;
    })
    .join("");

  canvas.innerHTML = `
    ${
      board.status === "Complete"
        ? `
          <div class="completion-brand" aria-label="Completed YESKIM board">
            ${brandVector}
            <span>
              <strong>YESKIM Board Complete</strong>
              <small>This board is ready for client review.</small>
            </span>
          </div>
        `
        : ""
    }
    ${items}
    ${board.items.length ? "" : `<button class="empty-board designer-only" type="button" id="emptyAdd"><span class="material-symbols-outlined">add</span></button>`}
  `;
}

function renderPanel() {
  const project = getActiveProject();
  const item = getActiveItem();
  if (!item) {
    panel.innerHTML = `
      <h2 id="panelTitle" class="sr-only">Inspector</h2>
      ${renderCompanyCard()}
      <div class="panel-toolbox designer-only">
        <button class="primary-button" type="button" id="addMaterial"><span class="material-symbols-outlined">add</span> Add asset</button>
        <button class="secondary-button" type="button" id="loadMaterial"><span class="material-symbols-outlined">inventory_2</span> Library</button>
        ${renderLibraryPreview()}
      </div>
    `;
    return;
  }

  const type = getBoardType(item);
  const isNote = type.id === "note";
  const deleteLabel = isNote ? "Delete memo" : "Delete asset";
  const selectedActions =
    mode === "designer"
      ? `
        <div class="panel-actions selected-actions" aria-label="Selected item actions">
          <button class="secondary-button icon-button" type="button" data-layer="back" aria-label="Send backward" title="Send backward"><span class="material-symbols-outlined">move_down</span></button>
          <button class="secondary-button icon-button" type="button" data-layer="front" aria-label="Bring forward" title="Bring forward"><span class="material-symbols-outlined">move_up</span></button>
          <button class="secondary-button danger-button icon-button" type="button" id="deleteItem" aria-label="${deleteLabel}" title="${deleteLabel}"><span class="material-symbols-outlined">delete</span></button>
        </div>
      `
      : "";
  const editForm =
    mode === "designer"
      ? isNote
        ? `
        <div class="edit-form note-edit-form">
          <label>Memo text<textarea data-edit="note">${escapeHtml(item.note)}</textarea></label>
        </div>
      `
        : `
        <div class="edit-form">
          <label class="board-type-select">Asset type
            <select data-board-type-select>
              ${renderBoardTypeOptions(type.id)}
            </select>
          </label>
          <label>Label<input data-edit="label" value="${escapeAttr(item.label)}"></label>
          <label>Description<textarea data-edit="note">${escapeHtml(item.note)}</textarea></label>
          <details class="detail-editor">
            <summary>Links / Source</summary>
            <div class="link-picker-field">
              <span>Related link</span>
              <button class="secondary-button" type="button" data-open-link-manager><span class="material-symbols-outlined">add_link</span> Manage links</button>
              <small>${escapeHtml(getItemLinkLabel(item))}</small>
            </div>
            <label>Source path<input data-edit="sourcePath" value="${escapeAttr(item.sourcePath)}"></label>
            <label>${type.specLabel}<textarea data-edit="spec">${escapeHtml(item.spec)}</textarea></label>
          </details>
        </div>
        <div class="panel-toolbox">
          <button class="primary-button" type="button" id="addMaterial"><span class="material-symbols-outlined">add</span> Add asset</button>
          <button class="secondary-button" type="button" id="saveMaterial"><span class="material-symbols-outlined">save</span> ${type.saveLabel}</button>
          <button class="secondary-button" type="button" id="loadMaterial"><span class="material-symbols-outlined">inventory_2</span> Library</button>
          ${renderLibraryPreview()}
        </div>
      `
      : "";

  panel.innerHTML = `
    <h2 id="panelTitle" class="sr-only">Inspector</h2>
    ${renderCompanyCard()}
    <div class="selected-detail">
      <p class="eyebrow">${type.sampleEyebrow}</p>
      <h3>${item.label}</h3>
      ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
      ${item.caution ? `<div class="caution-box"><strong>${type.cautionLabel}</strong><br>${item.caution}</div>` : ""}
      ${selectedActions}
    </div>
    ${editForm}
  `;
}

function renderDrawer() {
  if (activeTab === "references") {
    renderReferences();
    return;
  }
  renderSpec();
}

function renderSpec() {
  const rows = getActiveBoard().items
    .filter((item) => getBoardType(item).id === "material")
    .map((item) => {
      const type = getBoardType(item);
      return `
        <tr>
          <td><span>${type.label}</span><br>${item.label}</td>
          <td><strong>${item.name}</strong><br><span>${item.brand} · ${item.code}</span></td>
          <td>${item.spec}</td>
        </tr>
      `;
    })
    .join("");

  drawer.innerHTML = rows
    ? `
      <div class="drawer-intro">
        <div>
          <p class="eyebrow">Specification Draft</p>
          <h2>Specification draft from selected materials</h2>
        </div>
        <p>This draft only collects assets marked as Material.</p>
      </div>
      <div class="spec-table-wrap">
        <table class="spec-table">
          <thead><tr><th>Item</th><th>Selected material</th><th>Specification memo</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
    : `<div class="empty-state">Mark an asset as Material to generate a specification draft.</div>`;
}

function renderReferences() {
  const referenceCards = referenceBoards
    .map(
      (src, index) => `
        <figure class="reference-card">
          <img src="${src}" alt="Reference board image ${index + 1}">
          <figcaption>
            <span>Reference ${index + 1}</span>
            <button class="secondary-button designer-only" type="button" data-reference-upload="${index}"><span class="material-symbols-outlined">image</span> Change</button>
          </figcaption>
        </figure>
      `
    )
    .join("");

  drawer.innerHTML = `
    <div class="drawer-intro">
      <div>
        <p class="eyebrow">Reference Boards</p>
        <h2>Client share references</h2>
      </div>
      <p>Use these images as visual direction for final client share boards.</p>
    </div>
    <div class="reference-grid">
      ${referenceCards}
    </div>
  `;
}
function openNameDialog(options) {
  nameDialogAction = options;
  nameModalEyebrow.textContent = options.eyebrow || "Workspace";
  nameModalTitle.textContent = options.title;
  nameModalDescription.textContent = options.description;
  nameModalLabel.childNodes[0].nodeValue = `${options.label || "Name"} `;
  nameModalInput.value = options.value || "";
  nameModalInput.placeholder = options.placeholder || "";
  nameModalError.textContent = "";
  nameModalConfirm.textContent = options.confirmText || "Confirm";
  nameModalConfirm.classList.toggle("danger-button", Boolean(options.danger));
  nameModal.hidden = false;
  window.setTimeout(() => {
    nameModalInput.focus();
    nameModalInput.select();
  }, 0);
}

function closeNameDialog() {
  nameModal.hidden = true;
  nameDialogAction = null;
  nameModalInput.value = "";
  nameModalError.textContent = "";
  nameModalConfirm.classList.remove("danger-button");
}

function submitNameDialog() {
  if (!nameDialogAction) return;
  const value = nameModalInput.value.trim();
  if (!value) {
    nameModalError.textContent = "Enter a name.";
    return;
  }
  if (nameDialogAction.validate && !nameDialogAction.validate(value)) return;
  nameDialogAction.onSubmit(value);
  closeNameDialog();
}

function requestCreateProject() {
  openNameDialog({
    eyebrow: "Projects",
    title: "New project",
    description: "Enter the project name to create.",
    label: "Project name",
    placeholder: getSuggestedProjectName(),
    confirmText: "Create",
    onSubmit: createProject,
  });
}

function createProject(name) {
  const id = `project-${Date.now()}`;
  const project = {
    id,
    name,
    client: name.replace(/\s*(client|site|project).*$/i, "") || "Client",
    site: "Site information",
    boards: [createBoard("Board 1")],
  };
  projects = [...projects, project];
  activeProjectId = id;
  activeBoardId = project.boards[0].id;
  activeItemId = null;
  render();
  if (saveProjects()) {
    showToast("Project created.");
  }
}

function createBoard(name = "New board") {
  return {
    id: `board-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    meeting: "Proposal meeting",
    date: new Date().toLocaleDateString("ko-KR"),
    status: "Draft",
    references: [],
    items: [],
  };
}

function requestCreateBoard() {
  openNameDialog({
    eyebrow: "Boards",
    title: "New board",
    description: "Enter the board name to create.",
    label: "Board name",
    placeholder: getSuggestedBoardName(),
    confirmText: "Create",
    onSubmit: createBoardInActiveProject,
  });
}

function createBoardInActiveProject(name) {
  const board = createBoard(name);
  updateProject((project) => ({ ...project, boards: [...project.boards, board] }), false);
  activeBoardId = board.id;
  activeItemId = null;
  render();
  if (saveProjects()) {
    showToast("Board created.");
  }
}

function deleteActiveProject() {
  const project = getActiveProject();
  if (!project) return;
  if (projects.length <= 1) {
    showToast("The last project cannot be deleted.");
    return;
  }
  openNameDialog({
    eyebrow: "Projects",
    title: "Delete project",
    description: `Review the project name, then confirm deletion.`,
    label: "Project name",
    value: project.name,
    placeholder: project.name,
    confirmText: "Delete",
    danger: true,
    validate(value) {
      if (value !== project.name) {
        nameModalError.textContent = "Project name does not match.";
        return false;
      }
      return true;
    },
    onSubmit() {
      removeProject(project.id);
    },
  });
}

function removeProject(projectId) {
  const project = projects.find((entry) => entry.id === projectId);
  if (!project || projects.length <= 1) return;
  const nextProjects = projects.filter((entry) => entry.id !== project.id);
  projects = nextProjects;
  activeProjectId = nextProjects[0].id;
  activeBoardId = nextProjects[0].boards[0]?.id || null;
  activeItemId = getActiveBoard().items[0]?.id || null;
  activeTab = "spec";
  saveProjects(true);
  render();
  showToast("Project deleted.");
}

function deleteActiveBoard() {
  const project = getActiveProject();
  const board = getActiveBoard();
  if (project.boards.length <= 1) {
    showToast("The last board cannot be deleted.");
    return;
  }
  openNameDialog({
    eyebrow: "Boards",
    title: "Delete board",
    description: `Review the board name, then confirm deletion.`,
    label: "Board name",
    value: board.name,
    placeholder: board.name,
    confirmText: "Delete",
    danger: true,
    validate(value) {
      if (value !== board.name) {
        nameModalError.textContent = "Board name does not match.";
        return false;
      }
      return true;
    },
    onSubmit() {
      removeBoard(board.id);
    },
  });
}

function removeBoard(boardId) {
  const project = getActiveProject();
  const board = project.boards.find((entry) => entry.id === boardId);
  if (!board || project.boards.length <= 1) return;
  const boards = project.boards.filter((entry) => entry.id !== board.id);
  updateProject((target) => ({ ...target, boards }), false);
  activeBoardId = boards[0].id;
  activeItemId = boards[0].items[0]?.id || null;
  activeTab = "spec";
  saveProjects(true);
  render();
  showToast("Board deleted.");
}

function completeProject() {
  updateBoard((board) => ({
    ...board,
    status: "Complete",
    completedAt: new Date().toISOString(),
  }));
  saveProjects(true);
  render();
  showToast("Board marked complete.");
}

function saveCurrentLayout() {
  const project = getActiveProject();
  const board = getActiveBoard();
  if (!board.items.length) {
    showToast("There is no layout to save yet.");
    return;
  }
  const name = window.prompt("Enter a layout name.", `${project.name} ${board.name} layout`);
  if (!name?.trim()) {
    showToast("Layout save canceled.");
    return;
  }
  const layout = {
    id: `layout-${Date.now()}`,
    name: name.trim(),
    savedAt: new Date().toISOString(),
    slots: board.items.map((item) => ({
      boardType: item.boardType || "material",
      label: item.label,
      category: item.category,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      rotate: item.rotate,
      z: item.z,
    })),
  };
  saveLayoutLibrary([layout, ...loadLayoutLibrary()]);
  showToast("Board layout saved.");
}

function loadSavedLayout() {
  const layouts = loadLayoutLibrary();
  if (!layouts.length) {
    showToast("No saved layouts yet.");
    return;
  }
  const list = layouts.map((layout, index) => `${index + 1}. ${layout.name}`).join("\n");
  const answer = window.prompt(`Enter the layout number to load.\n\n${list}`, "1");
  const layout = layouts[Number(answer) - 1];
  if (!layout) {
    showToast("Layout load canceled.");
    return;
  }
  const items = layout.slots.map((slot, index) => ({
    ...createDefaultItem(slot.boardType || "material"),
    id: `item-${Date.now()}-${index}`,
    label: slot.label || createDefaultItem(slot.boardType || "material").label,
    category: slot.category || createDefaultItem(slot.boardType || "material").category,
    x: slot.x,
    y: slot.y,
    w: slot.w,
    h: slot.h,
    rotate: slot.rotate,
    z: slot.z,
  }));
  updateBoard((board) => ({ ...board, items, status: "Draft" }));
  activeItemId = items[0]?.id || null;
  saveProjects(true);
  render();
  showToast("Saved layout loaded.");
}
function addItem(typeId = "material") {
  const board = getActiveBoard();
  const id = `item-${Date.now()}`;
  const maxZ = board.items.reduce((max, item) => Math.max(max, item.z), 0);
  const item = {
    ...createDefaultItem(typeId),
    id,
    x: 34,
    y: 34,
    w: 24,
    h: 24,
    rotate: 0,
    z: maxZ + 1,
  };
  updateBoard((target) => ({ ...target, items: [...target.items, item] }));
  activeItemId = id;
  saveProjects(true);
  render();
}

function changeActiveBoardType(typeId) {
  const item = getActiveItem();
  const nextType = getBoardType(typeId);
  if (!item || item.boardType === nextType.id) return;

  const currentType = getBoardType(item);
  const patch = { boardType: nextType.id };
  if (!item.name || item.name === currentType.defaultName) patch.name = nextType.defaultName;
  if (!item.label || item.label === currentType.defaultLabel) patch.label = nextType.defaultLabel;
  if (!item.category || item.category === currentType.defaultCategory) patch.category = nextType.defaultCategory;
  if (!item.note || item.note === currentType.defaultNote) patch.note = nextType.defaultNote;
  if (!item.caution || item.caution === currentType.defaultCaution) patch.caution = nextType.defaultCaution;
  if (!item.spec || item.spec === currentType.defaultSpec) patch.spec = nextType.defaultSpec;

  updateItem(item.id, patch);
  saveProjects();
  render();
}

function getMaterialPayload(item) {
  return {
    boardType: item.boardType || "material",
    name: item.name,
    label: item.label,
    category: item.category,
    brand: item.brand,
    code: item.code,
    image: item.image,
    linkId: item.linkId || "",
    linkTitle: item.linkTitle || "",
    linkUrl: item.linkUrl || "",
    sourcePath: item.sourcePath || "",
    note: item.note,
    caution: item.caution,
    spec: item.spec,
    pinned: Boolean(item.pinned),
  };
}

function saveActiveMaterialToLibrary() {
  const item = getActiveItem();
  if (!item) {
    showToast("Select an asset before saving.");
    return;
  }
  const library = loadMaterialLibrary();
  const payload = {
    id: `library-${Date.now()}`,
    savedAt: new Date().toISOString(),
    ...getMaterialPayload(item),
    pinned: false,
  };
  saveMaterialLibrary([payload, ...library]);
  showToast("Asset saved to library.");
  renderPanel();
}

function toggleLibraryPin(materialId) {
  const library = loadMaterialLibrary();
  const target = library.find((material) => material.id === materialId);
  if (!target) return;
  saveMaterialLibrary(library.map((material) => (
    material.id === materialId ? { ...material, pinned: !Boolean(material.pinned) } : material
  )));
  renderPanel();
  showToast(target.pinned ? "Asset unpinned." : "Asset pinned.");
}

function deleteLibraryMaterial(materialId) {
  const library = loadMaterialLibrary();
  const target = library.find((material) => material.id === materialId);
  if (!target) return;
  const ok = window.confirm(`Delete "${target.label || target.name}" from the library?`);
  if (!ok) return;
  saveMaterialLibrary(library.filter((material) => material.id !== materialId));
  renderPanel();
  showToast("Library item deleted.");
}

function loadMaterialFromLibrary(materialId) {
  const library = loadMaterialLibrary();
  if (!library.length) {
    showToast("No saved library items yet.");
    return;
  }
  let material = materialId ? library.find((item) => item.id === materialId) : null;
  if (!material) {
    const list = library.map((item, index) => `${index + 1}. ${item.label || item.name} / ${item.brand || "No brand"}`).join("\n");
    const answer = window.prompt(`Enter the asset number to load.\n\n${list}`, "1");
    const index = Number(answer) - 1;
    material = library[index];
  }
  if (!material) {
    showToast("Asset load canceled.");
    return;
  }
  const board = getActiveBoard();
  const maxZ = board.items.reduce((max, item) => Math.max(max, item.z), 0);
  const item = {
    ...material,
    id: `item-${Date.now()}`,
    pinned: false,
    x: 36,
    y: 32,
    w: 24,
    h: 24,
    rotate: 0,
    z: maxZ + 1,
  };
  updateBoard((target) => ({ ...target, items: [...target.items, item] }));
  activeItemId = item.id;
  saveProjects(true);
  render();
}

function deleteActiveItem() {
  if (!activeItemId) return;
  updateBoard((board) => {
    const items = board.items.filter((item) => item.id !== activeItemId);
    activeItemId = items[0]?.id || null;
    return { ...board, items };
  });
  saveProjects(true);
  render();
}

function moveLayer(direction) {
  const item = getActiveItem();
  if (!item) return;
  updateItem(item.id, { z: direction === "front" ? item.z + 1 : Math.max(1, item.z - 1) });
  render();
}

function normalizeExternalUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function openCompanyWebsite() {
  const url = normalizeExternalUrl(companyWebsite);
  if (!url) {
    showToast("Enter the company website URL first.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function addMemoToBoard() {
  const text = String(document.querySelector("[data-board-memo]")?.value || memoDraft).trim();
  if (!text) {
    showToast("Write a memo before adding it to the board.");
    return;
  }
  const board = getActiveBoard();
  const maxZ = board.items.reduce((max, item) => Math.max(max, item.z), 0);
  const item = {
    ...createDefaultItem("note"),
    id: `item-note-${Date.now()}`,
    label: "Memo",
    name: text.split(/\s+/).slice(0, 4).join(" ") || "Meeting memo",
    note: text,
    x: 62,
    y: 14,
    w: 24,
    h: 12,
    rotate: 0,
    z: maxZ + 1,
  };
  updateBoard((target) => ({ ...target, items: [...target.items, item] }));
  activeItemId = item.id;
  editingNoteId = item.id;
  memoDraft = "";
  localStorage.removeItem(MEMO_DRAFT_KEY);
  saveProjects(true);
  render();
  requestAnimationFrame(focusEditingNote);
  showToast("Memo added to board.");
}

function openItemLink(itemId) {
  const item = getActiveBoard().items.find((entry) => entry.id === itemId);
  const url = normalizeExternalUrl(item?.linkUrl);
  if (!url) {
    showToast("No related link to open.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
function renderLinkModal() {
  const list = document.querySelector("#linkList");
  const item = getActiveItem();
  if (!list) return;

  const links = loadLinkLibrary();
  list.innerHTML = links.length
    ? links
        .map((link) => {
          const checked = item?.linkId === link.id || (!item?.linkId && item?.linkUrl && item.linkUrl === link.url);
          return `
            <article class="link-row" data-link-row="${link.id}">
              <label class="link-check">
                <input type="checkbox" data-link-select="${link.id}" ${checked ? "checked" : ""}>
                <span>Connect</span>
              </label>
              <label>Title<input data-link-title="${link.id}" value="${escapeAttr(link.title)}"></label>
              <label>URL<input data-link-url="${link.id}" value="${escapeAttr(link.url)}"></label>
              <div class="link-row-actions">
                <button class="secondary-button icon-button" type="button" data-link-save="${link.id}" aria-label="Save link" title="Save link"><span class="material-symbols-outlined">check</span></button>
                <button class="secondary-button icon-button" type="button" data-link-open="${link.id}" aria-label="Open link" title="Open link"><span class="material-symbols-outlined">open_in_new</span></button>
                <button class="secondary-button danger-button icon-button" type="button" data-link-delete="${link.id}" aria-label="Delete link" title="Delete link"><span class="material-symbols-outlined">delete</span></button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="link-empty">No links yet. Add product pages, folders, or references here.</p>`;
}

function openLinkManager() {
  const modal = document.querySelector("#linkModal");
  if (!modal) return;
  renderLinkModal();
  modal.hidden = false;
  document.querySelector("#linkTitleInput")?.focus();
}

function closeLinkManager() {
  const modal = document.querySelector("#linkModal");
  if (modal) modal.hidden = true;
}

function addLinkEntry() {
  const titleInput = document.querySelector("#linkTitleInput");
  const urlInput = document.querySelector("#linkUrlInput");
  const url = normalizeExternalUrl(urlInput?.value || "");
  const title = String(titleInput?.value || "").trim() || url;
  if (!url) {
    showToast("Enter a link URL.");
    return;
  }
  saveLinkLibrary([
    { id: `link-${Date.now()}`, title, url, createdAt: new Date().toISOString() },
    ...loadLinkLibrary(),
  ]);
  if (titleInput) titleInput.value = "";
  if (urlInput) urlInput.value = "";
  renderLinkModal();
  showToast("Link added.");
}

function saveLinkEntry(linkId) {
  const titleInput = document.querySelector(`[data-link-title="${linkId}"]`);
  const urlInput = document.querySelector(`[data-link-url="${linkId}"]`);
  const url = normalizeExternalUrl(urlInput?.value || "");
  const title = String(titleInput?.value || "").trim() || url;
  if (!url) {
    showToast("Enter a link URL.");
    return;
  }
  const links = loadLinkLibrary();
  saveLinkLibrary(links.map((link) => (link.id === linkId ? { ...link, title, url } : link)));
  updateLinkedItems(linkId, { linkTitle: title, linkUrl: url });
  saveProjects();
  render();
  openLinkManager();
  showToast("Link updated.");
}

function deleteLinkEntry(linkId) {
  const links = loadLinkLibrary();
  const target = links.find((link) => link.id === linkId);
  if (!target) return;
  const ok = window.confirm(`Delete link "${target.title || target.url}"?`);
  if (!ok) return;
  saveLinkLibrary(links.filter((link) => link.id !== linkId));
  updateLinkedItems(linkId, { linkId: "", linkTitle: "", linkUrl: "" });
  saveProjects();
  render();
  openLinkManager();
  showToast("Link deleted.");
}

function updateLinkedItems(linkId, patch) {
  projects = projects.map((project) => ({
    ...project,
    boards: project.boards.map((board) => ({
      ...board,
      items: board.items.map((item) => (item.linkId === linkId ? { ...item, ...patch } : item)),
    })),
  }));
}

function toggleLinkConnection(linkId, checked) {
  const item = getActiveItem();
  const link = loadLinkLibrary().find((entry) => entry.id === linkId);
  if (!item || !link) return;
  updateItem(item.id, checked
    ? { linkId: link.id, linkTitle: link.title, linkUrl: link.url }
    : { linkId: "", linkTitle: "", linkUrl: "" }
  );
  saveProjects();
  render();
  openLinkManager();
  showToast(checked ? "Link connected." : "Link disconnected.");
}

function openLibraryLink(linkId) {
  const link = loadLinkLibrary().find((entry) => entry.id === linkId);
  const url = normalizeExternalUrl(link?.url);
  if (!url) {
    showToast("No link to open.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function enterFullscreen() {
  const frame = document.querySelector(".sketchbook-frame");
  if (document.fullscreenElement) {
    document.exitFullscreen();
    return;
  }
  frame?.requestFullscreen?.();
}

function handlePointerDown(event) {
  if (mode === "client") return;
  rememberCanvasPasteAnchor(event);
  if (event.target.closest("[data-upload-item], [data-open-link]")) return;
  const noteEditTarget = event.target.closest("[data-note-edit]");
  if (noteEditTarget && noteEditTarget.isContentEditable) return;
  if (noteEditTarget) {
    const noteId = noteEditTarget.dataset.noteEdit;
    const now = Date.now();
    const isDoubleTap = lastNotePointer.id === noteId && now - lastNotePointer.time < 450;
    lastNotePointer = { id: noteId, time: now };
    if (event.detail >= 2 || isDoubleTap) {
      event.preventDefault();
      startNoteEdit(noteId);
      return;
    }
  }
  const target = event.target.closest("[data-item]");
  const resizeTarget = event.target.closest("[data-resize]");
  const rotateTarget = event.target.closest("[data-rotate]");
  if (!target && !resizeTarget && !rotateTarget) return;

  const itemId = resizeTarget?.dataset.resize || rotateTarget?.dataset.rotate || target.dataset.item;
  const item = getActiveBoard().items.find((entry) => entry.id === itemId);
  if (!item) return;

  activeItemId = itemId;
  const rect = canvas.getBoundingClientRect();
  const itemRect = document.querySelector(`[data-item="${itemId}"]`)?.getBoundingClientRect();
  const center = itemRect
    ? {
        x: itemRect.left + itemRect.width / 2,
        y: itemRect.top + itemRect.height / 2,
      }
    : { x: event.clientX, y: event.clientY };
  const startAngle = Math.atan2(event.clientY - center.y, event.clientX - center.x) * (180 / Math.PI);
  dragState = {
    type: rotateTarget ? "rotate" : resizeTarget ? "resize" : "move",
    itemId,
    startX: event.clientX,
    startY: event.clientY,
    rect,
    center,
    startAngle,
    start: { ...item },
  };
  event.preventDefault();
  target?.setPointerCapture?.(event.pointerId);
  render();
}

function handlePointerMove(event) {
  if (!dragState) return;
  const dx = ((event.clientX - dragState.startX) / dragState.rect.width) * 100;
  const dy = ((event.clientY - dragState.startY) / dragState.rect.height) * 100;
  const start = dragState.start;

  if (dragState.type === "move") {
    updateItem(dragState.itemId, {
      x: clamp(start.x + dx, 0, 96),
      y: clamp(start.y + dy, 0, 96),
    }, false);
  } else if (dragState.type === "resize") {
    updateItem(dragState.itemId, {
      w: clamp(start.w + dx, 7, 70),
      h: clamp(start.h + dy, 7, 70),
    }, false);
  } else {
    const currentAngle =
      Math.atan2(event.clientY - dragState.center.y, event.clientX - dragState.center.x) * (180 / Math.PI);
    updateItem(dragState.itemId, {
      rotate: clamp(start.rotate + currentAngle - dragState.startAngle, -45, 45),
    }, false);
  }
  applyItemVisual(dragState.itemId);
}

function handlePointerUp() {
  if (!dragState) return;
  dragState = null;
  saveProjects();
  render();
}

function rememberCanvasPasteAnchor(event) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  pasteAnchor = {
    x: clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96),
    y: clamp(((event.clientY - rect.top) / rect.height) * 100, 4, 96),
  };
}

function handleFieldEdit(event) {
  const companyWebsiteField = event.target.closest("[data-company-website]");
  if (companyWebsiteField) {
    companyWebsite = companyWebsiteField.value;
    saveCompanyWebsite();
    return;
  }

  const memoField = event.target.closest("[data-board-memo]");
  if (memoField) {
    memoDraft = memoField.value;
    localStorage.setItem(MEMO_DRAFT_KEY, memoDraft);
    return;
  }

  const item = getActiveItem();
  if (!item) return;

  const noteEditor = event.target.closest("[data-note-edit]");
  if (noteEditor) {
    const note = noteEditor.textContent.trim();
    updateItem(noteEditor.dataset.noteEdit, {
      note,
      name: note.split(/\s+/).slice(0, 4).join(" ") || "Meeting memo",
    });
    renderPanel();
    return;
  }

  const textField = event.target.closest("[data-edit]");
  if (textField) {
    const patch = { [textField.dataset.edit]: textField.value };
    if (textField.dataset.edit === "label") patch.name = textField.value || getBoardType(item).defaultName;
    updateItem(item.id, patch);
    renderCanvas();
    renderDrawer();
    return;
  }

  const numberField = event.target.closest("[data-edit-number]");
  if (numberField) {
    updateItem(item.id, { [numberField.dataset.editNumber]: Number(numberField.value) });
    renderCanvas();
  }
}
function optimizeImageFile(file, onComplete, options = {}) {
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const maxEdge = Math.max(image.naturalWidth, image.naturalHeight);
      const scale = Math.min(1, IMAGE_MAX_EDGE / maxEdge);
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const workCanvas = document.createElement("canvas");
      workCanvas.width = width;
      workCanvas.height = height;
      const context = workCanvas.getContext("2d");
      if (!context) {
        onComplete(reader.result);
        return;
      }
      const outputType = options.outputType || (file.type === "image/png" ? "image/png" : "image/jpeg");
      if (outputType === "image/jpeg") {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);
      const quality = options.quality ?? IMAGE_QUALITY;
      const optimizedImage =
        outputType === "image/jpeg" ? workCanvas.toDataURL(outputType, quality) : workCanvas.toDataURL(outputType);
      onComplete(optimizedImage);
    };
    image.onerror = () => onComplete(reader.result);
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function commitItemImage(itemId, imageData) {
  updateItem(itemId, { image: imageData }, false);
  saveProjects(true);
  render();
}

function getImageSize(imageData, onComplete) {
  const image = new Image();
  image.onload = () => onComplete(image.naturalWidth || 1, image.naturalHeight || 1);
  image.onerror = () => onComplete(16, 9);
  image.src = imageData;
}

function getPastedImageSize(width, height) {
  const rect = canvas.getBoundingClientRect();
  const canvasRatio = rect.width && rect.height ? rect.width / rect.height : 16 / 9;
  const imageRatio = width && height ? width / height : 16 / 9;
  let w = 38;
  let h = (w / imageRatio) * canvasRatio;
  if (h > 38) {
    h = 38;
    w = (h * imageRatio) / canvasRatio;
  }
  return {
    w: clamp(w, 16, 44),
    h: clamp(h, 14, 40),
  };
}

function addPastedImageToBoard(file) {
  optimizeImageFile(file, (imageData) => {
    getImageSize(imageData, (width, height) => {
      const board = getActiveBoard();
      const maxZ = board.items.reduce((max, item) => Math.max(max, item.z), 0);
      const size = getPastedImageSize(width, height);
      const item = {
        ...createDefaultItem("image"),
        id: `item-paste-${Date.now()}`,
        name: "Pasted screenshot",
        label: "Screenshot",
        category: "Clipboard",
        image: imageData,
        note: "Pasted from clipboard.",
        x: clamp(pasteAnchor.x - size.w / 2, 0, 100 - size.w),
        y: clamp(pasteAnchor.y - size.h / 2, 0, 100 - size.h),
        w: size.w,
        h: size.h,
        rotate: 0,
        z: maxZ + 1,
      };
      updateBoard((target) => ({ ...target, items: [...target.items, item] }));
      activeItemId = item.id;
      saveProjects(true);
      render();
      showToast("Screenshot added to board.");
    });
  }, { outputType: "image/jpeg", quality: 0.82 });
}

function readImageFile(itemId, file) {
  optimizeImageFile(file, (imageData) => commitItemImage(itemId, imageData));
}

function openImagePickerForItem(itemId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", () => {
    if (input.files?.[0]) readImageFile(itemId, input.files[0]);
  });
  input.click();
}

function openReferencePicker(index) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", () => {
    if (!input.files?.[0]) return;
    optimizeImageFile(input.files[0], (imageData) => {
      referenceBoards = referenceBoards.map((src, targetIndex) => (targetIndex === index ? imageData : src));
      saveReferenceBoards();
      renderReferences();
      showToast("Reference image updated.");
    });
  });
  input.click();
}

function addBoardReference() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", () => {
    if (!input.files?.[0]) return;
    const title = input.files[0].name.replace(/\.[^.]+$/, "") || "Reference";
    optimizeImageFile(input.files[0], (imageData) => {
      updateBoard((board) => ({
        ...board,
        references: [createReferenceEntry(imageData, title), ...(board.references || [])],
      }));
      saveProjects(true);
      render();
      showToast("Reference image added.");
    });
  });
  input.click();
}

function deleteBoardReference(referenceId) {
  updateBoard((board) => ({
    ...board,
    references: (board.references || []).filter((reference) => reference.id !== referenceId),
  }));
  saveProjects(true);
  render();
  closeReferencePreview();
  showToast("Reference image deleted.");
}

function openReferencePreview(referenceId) {
  const reference = (getActiveBoard().references || []).find((entry) => entry.id === referenceId);
  const modal = document.querySelector("#referenceModal");
  const image = document.querySelector("#referencePreviewImage");
  if (!reference || !modal || !image) return;
  image.src = reference.src;
  image.alt = reference.title;
  modal.hidden = false;
}

function closeReferencePreview() {
  const modal = document.querySelector("#referenceModal");
  if (modal) modal.hidden = true;
}

function openPanelLogoPicker() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.addEventListener("change", () => {
    if (!input.files?.[0]) return;
    optimizeImageFile(input.files[0], (imageData) => {
      panelLogo = imageData;
      savePanelLogo();
      renderPanel();
      showToast("Logo image updated.");
    });
  });
  input.click();
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportWorkspaceData() {
  saveProjects();
  const payload = {
    app: "yeskim-drawing-review",
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    activeProjectId,
    activeBoardId,
    projects,
    materialLibrary: loadMaterialLibrary(),
    linkLibrary: loadLinkLibrary(),
    layoutLibrary: loadLayoutLibrary(),
    referenceBoards,
    panelLogo,
    companyWebsite,
  };
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  downloadJson(`yeskim-drawing-review-${date}.json`, payload);
  showToast("Workspace data exported.");
}

function importWorkspaceData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported.projects) || !imported.projects.length) {
          showToast("No project data found in the file.");
          return;
        }
        const ok = window.confirm("Replace the current local workspace with the imported file?");
        if (!ok) {
          showToast("Import canceled.");
          return;
        }

        projects = normalizeProjects(imported.projects);
        activeProjectId = projects.some((project) => project.id === imported.activeProjectId)
          ? imported.activeProjectId
          : projects[0].id;
        activeBoardId = getActiveProject().boards.some((board) => board.id === imported.activeBoardId)
          ? imported.activeBoardId
          : getActiveProject().boards[0]?.id || null;
        activeItemId = getActiveBoard().items[0]?.id || null;
        referenceBoards =
          Array.isArray(imported.referenceBoards) && imported.referenceBoards.length
            ? defaultReferenceBoards.map((src, index) => imported.referenceBoards[index] || src)
            : [...defaultReferenceBoards];
        panelLogo = imported.panelLogo || defaultPanelLogo;
        companyWebsite = imported.companyWebsite || "";

        saveProjects();
        saveMaterialLibrary(Array.isArray(imported.materialLibrary) ? imported.materialLibrary : []);
        saveLinkLibrary(Array.isArray(imported.linkLibrary) ? imported.linkLibrary : []);
        saveLayoutLibrary(Array.isArray(imported.layoutLibrary) ? imported.layoutLibrary : []);
        saveReferenceBoards();
        savePanelLogo();
        saveCompanyWebsite();
        render();
        showToast("Workspace data imported.");
      } catch {
        showToast("Could not read the JSON file.");
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function handleImageUpload(event) {
  const input = event.target.closest("#imageUpload");
  const item = getActiveItem();
  if (!input || !item || !input.files?.[0]) return;
  readImageFile(item.id, input.files[0]);
}

function resetAll() {
  localStorage.removeItem(PROJECTS_KEY);
  localStorage.removeItem(ACTIVE_PROJECT_KEY);
  localStorage.removeItem(ACTIVE_BOARD_KEY);
  localStorage.removeItem(REFERENCE_BOARDS_KEY);
  localStorage.removeItem(PANEL_LOGO_KEY);
  localStorage.removeItem(COMPANY_WEBSITE_KEY);
  localStorage.removeItem(MEMO_DRAFT_KEY);
  localStorage.removeItem(LINK_LIBRARY_KEY);
  projects = structuredClone(defaultProjects);
  activeProjectId = projects[0].id;
  activeBoardId = projects[0].boards[0]?.id || null;
  activeItemId = getActiveBoard().items[0]?.id || null;
  activeTab = "spec";
  referenceBoards = [...defaultReferenceBoards];
  panelLogo = defaultPanelLogo;
  companyWebsite = "";
  memoDraft = "";
  render();
  showToast("Workspace has been reset.");
}

function isEditablePasteTarget(target) {
  return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));
}

function handleClipboardPaste(event) {
  if (mode !== "designer" || isEditablePasteTarget(event.target)) return;
  if (!document.querySelector("#linkModal")?.hidden || !document.querySelector("#referenceModal")?.hidden) return;
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.kind === "file" && item.type.startsWith("image/"));
  const file = imageItem?.getAsFile();
  if (!file) return;
  event.preventDefault();
  addPastedImageToBoard(file);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}
projectSelect.addEventListener("change", (event) => {
  activeProjectId = event.target.value;
  activeBoardId = getActiveProject().boards[0]?.id || null;
  activeItemId = getActiveBoard().items[0]?.id || null;
  saveProjects();
  render();
});

boardSelect.addEventListener("change", (event) => {
  activeBoardId = event.target.value;
  activeItemId = getActiveBoard().items[0]?.id || null;
  saveProjects();
  render();
});

document.addEventListener("click", (event) => {
  const modeButton = event.target.closest("[data-mode]");
  if (modeButton) {
    mode = modeButton.dataset.mode;
    render();
    return;
  }

  const tabButton = event.target.closest("[data-tab]");
  if (tabButton) {
    activeTab = tabButton.dataset.tab;
    render();
    return;
  }

  const libraryDeleteButton = event.target.closest("[data-library-delete]");
  if (libraryDeleteButton) {
    deleteLibraryMaterial(libraryDeleteButton.dataset.libraryDelete);
    return;
  }

  const libraryPinButton = event.target.closest("[data-library-pin]");
  if (libraryPinButton) {
    toggleLibraryPin(libraryPinButton.dataset.libraryPin);
    return;
  }

  const libraryButton = event.target.closest("[data-library-load]");
  if (libraryButton) {
    loadMaterialFromLibrary(libraryButton.dataset.libraryLoad);
    return;
  }

  const referenceUploadButton = event.target.closest("[data-reference-upload]");
  if (referenceUploadButton) {
    openReferencePicker(Number(referenceUploadButton.dataset.referenceUpload));
    return;
  }

  if (event.target.closest("#addBoardReference")) {
    addBoardReference();
    return;
  }

  const referencePreviewButton = event.target.closest("[data-reference-preview]");
  if (referencePreviewButton) {
    openReferencePreview(referencePreviewButton.dataset.referencePreview);
    return;
  }

  const referenceDeleteButton = event.target.closest("[data-reference-delete]");
  if (referenceDeleteButton) {
    deleteBoardReference(referenceDeleteButton.dataset.referenceDelete);
    return;
  }

  if (event.target.closest("[data-close-reference-modal]") || event.target.id === "referenceModal") {
    closeReferencePreview();
    return;
  }

  if (event.target.closest("[data-open-company-site]")) {
    openCompanyWebsite();
    return;
  }

  if (event.target.closest("#addBoardMemo")) {
    addMemoToBoard();
    return;
  }

  if (editingNoteId && !event.target.closest(`[data-item="${editingNoteId}"]`) && !event.target.closest("#choicePanel")) {
    stopNoteEdit({ renderPanelOnly: false });
    return;
  }

  const openLinkButton = event.target.closest("[data-open-link]");
  if (openLinkButton) {
    openItemLink(openLinkButton.dataset.openLink);
    return;
  }

  const openLinkManagerButton = event.target.closest("[data-open-link-manager]");
  if (openLinkManagerButton) {
    openLinkManager();
    return;
  }

  if (event.target.closest("[data-close-link-modal]") || event.target.id === "linkModal") {
    closeLinkManager();
    return;
  }

  if (event.target.closest("[data-close-name-modal]") || event.target.id === "nameModal") {
    closeNameDialog();
    return;
  }

  if (event.target.closest("#nameModalConfirm")) {
    submitNameDialog();
    return;
  }

  if (event.target.closest("#addLinkEntry")) {
    addLinkEntry();
    return;
  }

  const linkSelect = event.target.closest("[data-link-select]");
  if (linkSelect) {
    toggleLinkConnection(linkSelect.dataset.linkSelect, linkSelect.checked);
    return;
  }

  const linkSave = event.target.closest("[data-link-save]");
  if (linkSave) {
    saveLinkEntry(linkSave.dataset.linkSave);
    return;
  }

  const linkOpen = event.target.closest("[data-link-open]");
  if (linkOpen) {
    openLibraryLink(linkOpen.dataset.linkOpen);
    return;
  }

  const linkDelete = event.target.closest("[data-link-delete]");
  if (linkDelete) {
    deleteLinkEntry(linkDelete.dataset.linkDelete);
    return;
  }

  const panelLogoButton = event.target.closest("[data-upload-panel-logo]");
  if (panelLogoButton) {
    openPanelLogoPicker();
    return;
  }

  const activeImageUploadButton = event.target.closest("[data-upload-active-image]");
  if (activeImageUploadButton) {
    const item = getActiveItem();
    if (item) openImagePickerForItem(item.id);
    return;
  }

  const uploadButton = event.target.closest("[data-upload-item]");
  if (uploadButton) {
    activeItemId = uploadButton.dataset.uploadItem;
    openImagePickerForItem(activeItemId);
    return;
  }

  const noteClickTarget = event.target.closest("[data-note-edit]");
  if (noteClickTarget?.isContentEditable) return;

  const itemButton = event.target.closest("[data-item], [data-item-note]");
  if (itemButton && !event.target.closest("[data-resize]") && !event.target.closest("[data-rotate]")) {
    activeItemId = itemButton.dataset.item || itemButton.dataset.itemNote;
    if (editingNoteId && editingNoteId !== activeItemId) editingNoteId = null;
    const item = getActiveItem();
    if (event.detail >= 2 && getBoardType(item).id === "note") {
      startNoteEdit(activeItemId);
      return;
    }
    render();
    return;
  }

  if (event.target.closest("#newProject")) requestCreateProject();
  if (event.target.closest("#deleteProject")) deleteActiveProject();
  if (event.target.closest("#newBoard") || event.target.closest("#sidebarNewBoard")) requestCreateBoard();
  if (event.target.closest("#deleteBoard")) deleteActiveBoard();
  if (event.target.closest("#saveProject")) saveProjects(true);
  if (event.target.closest("#exportWorkspace")) exportWorkspaceData();
  if (event.target.closest("#importWorkspace")) importWorkspaceData();
  if (event.target.closest("#completeProject")) completeProject();
  if (event.target.closest("#themeToggle")) toggleTheme();
  if (event.target.closest("#saveLayout")) saveCurrentLayout();
  if (event.target.closest("#loadLayout")) loadSavedLayout();
  if (event.target.closest("#addMaterial") || event.target.closest("#emptyAdd")) addItem("material");
  if (event.target.closest("#saveMaterial")) saveActiveMaterialToLibrary();
  if (event.target.closest("#loadMaterial")) loadMaterialFromLibrary();
  if (event.target.closest("#deleteItem")) deleteActiveItem();
  if (event.target.closest("#fullscreenBoard")) enterFullscreen();
  if (event.target.closest("#resetBoard")) resetAll();

  const layerButton = event.target.closest("[data-layer]");
  if (layerButton) moveLayer(layerButton.dataset.layer);
});

document.addEventListener("input", handleFieldEdit);
document.addEventListener("dblclick", (event) => {
  const note = event.target.closest("[data-note-edit]");
  if (!note) return;
  startNoteEdit(note.dataset.noteEdit);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("#linkModal")?.hidden) {
    closeLinkManager();
  }
  if (event.key === "Escape" && !document.querySelector("#referenceModal")?.hidden) {
    closeReferencePreview();
  }
  if (event.key === "Escape" && !document.querySelector("#nameModal")?.hidden) {
    closeNameDialog();
  }
  if (event.key === "Escape" && editingNoteId) {
    event.preventDefault();
    stopNoteEdit();
  }
  if (event.key === "Enter" && event.target === nameModalInput) {
    event.preventDefault();
    submitNameDialog();
  }
});
document.addEventListener("paste", handleClipboardPaste);
document.addEventListener("change", (event) => {
  const typeSelect = event.target.closest("[data-board-type-select]");
  if (typeSelect) {
    changeActiveBoardType(typeSelect.value);
    return;
  }
  handleImageUpload(event);
});
canvas.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointermove", handlePointerMove);
document.addEventListener("pointerup", handlePointerUp);

render();
