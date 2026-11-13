"use strict";

const get = id => document.getElementById(id);
const map = get("map");
const signals = get("signals");
const origin = get("origin");
const callout = get("callout");
const details = get("details");
const composer = get("composer");
const hour = 3_600_000;
const start = Date.now();
const items = [
  { id: 1, title: "send the project outline", group: "design studio", due: start - hour,
    notes: "add the final sketches and share the draft with the group.", angle: 0 },
  { id: 2, title: "review the presentation", group: "personal", due: start + 5 * hour,
    notes: "check the opening slides and rehearse the last section.", angle: -0.85 },
  { id: 3, title: "bring the workshop notes", group: "design studio", due: null,
    notes: "bring the notes from our first session to the next meeting.", angle: 0.27 },
  { id: 4, title: "send the final poster", group: "design studio", due: start + 96 * hour,
    notes: "export a pdf and share it with the workshop group.", angle: 2.13 },
  { id: 5, title: "return the library book", group: "personal", due: null,
    notes: "the book is in the front pocket of my bag.", angle: -2.48 },
];
const dates = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const marks = new Map();
let now = start;
let nextId = 6;
let selected = null;
let centerSelected = false;
let zoom = 1;
let shownDetails = null;
let lastChange = null;

const isDue = item => item.due !== null && item.due <= now;
const kind = item => item.due === null ? "reminder" : "task";
const outcome = item => item.due === null ? "mark handled" : "mark complete";
const meta = item => [kind(item), item.group, item.due === null ? "no deadline" : "due " + dates.format(item.due).toLocaleLowerCase()].join(" · ");
const active = () => items.filter(item => !item.done);
const urgent = () => active().filter(isDue).sort((a, b) => a.due - b.due || a.id - b.id);

function action(label, handler, className = "text-action") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  const span = document.createElement("span");
  span.textContent = label;
  button.append(span);
  button.addEventListener("click", handler);
  return button;
}

function clearSelection() {
  selected = null;
  centerSelected = false;
  updateSelection();
}

function updateSelection() {
  for (const [id, mark] of marks) mark.setAttribute("aria-pressed", String(id === selected));
  origin.setAttribute("aria-pressed", String(centerSelected));
  get("urgent-section").toggleAttribute("data-selected", centerSelected);
  for (const row of document.querySelectorAll(".item")) {
    const id = Number(row.dataset.id);
    row.toggleAttribute("data-selected", id === selected || centerSelected && isDue(items.find(item => item.id === id)));
  }
  showCallout();
}

function showCallout() {
  const item = items.find(item => item.id === selected);
  const mark = marks.get(selected);
  callout.hidden = !mark || mark.hidden;
  if (callout.hidden) return;

  if (callout.dataset.id !== String(item.id)) {
    const context = document.createElement("p");
    context.className = "muted";
    context.textContent = meta(item);
    callout.replaceChildren(context, action(item.title + " ›", () => openItem(item)));
    callout.dataset.id = item.id;
  }
  const gap = 16;
  const x = mark.offsetLeft;
  const y = mark.offsetTop;
  const preferredX = x < map.clientWidth / 2 ? x + gap : x - callout.offsetWidth - gap;
  const preferredY = y < map.clientHeight / 2 ? y + gap : y - callout.offsetHeight - gap;
  callout.style.left = Math.max(2, Math.min(preferredX, map.clientWidth - callout.offsetWidth - 2)) + "px";
  callout.style.top = Math.max(2, Math.min(preferredY, map.clientHeight - callout.offsetHeight - 2)) + "px";
}

function paintMap() {
  const due = urgent();
  const pending = active().filter(item => !isDue(item)).sort((a, b) => (a.due ?? Infinity) - (b.due ?? Infinity) || a.id - b.id);
  const activeIds = new Set(pending.map(item => item.id));
  for (const [id, mark] of marks) {
    if (!activeIds.has(id)) {
      mark.remove();
      marks.delete(id);
    }
  }
  if (!activeIds.has(selected)) selected = null;
  if (!due.length) centerSelected = false;
  origin.hidden = due.length === 0;
  origin.firstElementChild.textContent = due.length;
  origin.setAttribute("aria-label", due.length + (due.length === 1 ? " urgent task" : " urgent tasks"));
  origin.style.setProperty("--dot", Math.min(64, 40 * zoom) + "px");
  get("empty-origin").hidden = due.length !== 0;
  get("map-empty").hidden = pending.length + due.length !== 0;
  map.style.setProperty("--zoom", zoom);
  get("zoom-level").textContent = (zoom % 0.5 === 0 ? zoom.toFixed(1) : zoom.toFixed(2)) + "×";
  get("zoom-in").disabled = zoom >= 2;
  get("zoom-out").disabled = zoom <= 1;
  get("reset-view").disabled = zoom === 1;
  const side = map.clientWidth || 400;
  const outer = Math.min(0.425, 0.5 - 24 / side);
  const placed = [];
  for (const item of pending) {
    const remaining = (item.due ?? Infinity) - now;
    const inward = Math.max(0, 1 - remaining / (7 * 24 * hour));
    const tint = Math.max(0, Math.min(1, (24 * hour - remaining) / (23 * hour)));
    const contact = (34 + 2 * inward) / side;
    const radius = (outer - (outer - contact) * inward) * zoom;
    let point;
    for (let step = 0; step < 72; step += 1) {
      const offset = step % 2 ? -(step + 1) / 2 : step / 2;
      const angle = item.angle + offset * Math.PI / 36;
      const candidate = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
      if (placed.every(p => Math.max(Math.abs(p.x - candidate.x), Math.abs(p.y - candidate.y)) * side >= 48)) {
        point = candidate;
        placed.push(point);
        break;
      }
    }
    let mark = marks.get(item.id);
    if (!mark) {
      mark = action("", () => {
        selected = selected === item.id ? null : item.id;
        centerSelected = false;
        updateSelection();
      }, "signal " + kind(item));
      mark.setAttribute("aria-label", kind(item) + ": " + item.title);
      marks.set(item.id, mark);
      signals.append(mark);
    }
    mark.hidden = !point || Math.max(Math.abs(point.x), Math.abs(point.y)) * side > side / 2 - 24;
    if (!mark.hidden) {
      mark.style.setProperty("--x", (50 + point.x * 100) + "%");
      mark.style.setProperty("--y", (50 + point.y * 100) + "%");
      mark.style.setProperty("--dot", Math.min(20, (8 + inward * 5) * zoom) + "px");
      mark.style.setProperty("--signal", "color-mix(in srgb, var(--red) " + Math.round(tint * 100) + "%, var(--ink))");
    }
  }
  updateSelection();
}

function itemRow(item) {
  const row = document.createElement("li");
  row.className = "item";
  row.dataset.id = item.id;
  if (item.due !== null && !item.done) {
    const check = document.createElement("label");
    check.className = "check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("aria-label", outcome(item) + ": " + item.title);
    input.addEventListener("change", () => changeOutcome(item, true));
    check.append(input);
    row.append(check);
  }
  const copy = document.createElement("div");
  copy.className = "item-copy";
  const title = action(item.title + " ›", () => openItem(item), "text-action item-title");
  const context = document.createElement("p");
  context.className = "muted";
  context.textContent = meta(item);
  copy.append(title, context);
  if (item.done || item.due === null) {
    copy.append(action(item.done ? "restore" : "mark handled", () => changeOutcome(item, !item.done), "text-action quiet"));
  }
  row.append(copy);
  return row;
}

function renderReading() {
  const term = get("search").value.trim().toLowerCase();
  const matches = item => (item.title + " " + item.group + " " + item.notes).toLowerCase().includes(term);
  const due = urgent().filter(matches);
  const remaining = active().filter(item => !isDue(item) && matches(item)).sort((a, b) => b.id - a.id);
  const done = items.filter(item => item.done && matches(item)).sort((a, b) => b.id - a.id);
  get("urgent-section").hidden = due.length === 0;
  get("urgent-items").replaceChildren(...due.map(itemRow));
  get("feed-items").replaceChildren(...remaining.map(itemRow));
  get("empty-feed").hidden = remaining.length !== 0;
  get("empty-feed").textContent = term ? "no matching items" : "nothing here yet";
  const history = get("history-toggle");
  history.hidden = done.length === 0;
  const expanded = history.getAttribute("aria-expanded") === "true";
  history.firstElementChild.textContent = expanded ? "hide history" : "history (" + done.length + ")";
  get("history-items").hidden = !expanded || done.length === 0;
  get("history-items").replaceChildren(...done.map(itemRow));
  updateSelection();
}

function openItem(item) {
  shownDetails = item;
  get("details-meta").textContent = meta(item);
  get("details-title").textContent = item.title;
  get("details-body").textContent = item.notes;
  get("details-body").hidden = !item.notes;
  get("details-action").firstElementChild.textContent = item.done ? "restore" : outcome(item);
  details.showModal();
}

function changeOutcome(item, done) {
  lastChange = { item, before: Boolean(item.done) };
  item.done = done;
  if (selected === item.id) clearSelection();
  renderReading();
  paintMap();
  get("feedback-text").textContent = done ? (item.due === null ? "handled" : "completed") : "restored";
  get("feedback").hidden = false;
  if (!get("groups-view").hidden) showGroups(true);
  get("undo").focus({ preventScroll: true });
}

function setZoom(value) {
  zoom = Math.max(1, Math.min(2, value));
  paintMap();
}

function showGroups(show) {
  get("ping-view").hidden = show;
  get("groups-view").hidden = !show;
  get(show ? "show-groups" : "show-ping").setAttribute("aria-current", "page");
  get(show ? "show-ping" : "show-groups").removeAttribute("aria-current");
  if (!show) {
    paintMap();
    return;
  }
  const sections = ["personal", "design studio"].map(group => {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    const list = document.createElement("ul");
    heading.textContent = group;
    list.className = "items";
    list.append(...active().filter(item => item.group === group).map(itemRow));
    section.append(heading, list);
    return section;
  });
  get("group-items").replaceChildren(...sections);
}

get("zoom-in").addEventListener("click", () => setZoom(zoom + 0.25));
get("zoom-out").addEventListener("click", () => setZoom(zoom - 0.25));
get("reset-view").addEventListener("click", () => setZoom(1));
get("map-help").addEventListener("click", () => get("help").showModal());
map.addEventListener("click", event => { if (!event.target.closest("button, .callout")) clearSelection(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) clearSelection();
});
origin.addEventListener("click", () => {
  if (centerSelected) {
    clearSelection();
    return;
  }
  selected = null;
  centerSelected = true;
  get("search").value = "";
  renderReading();
  get("urgent").focus({ preventScroll: true });
  get("urgent").scrollIntoView({ block: "nearest" });
});
get("open-search").addEventListener("click", () => {
  const form = get("search-form");
  form.hidden = !form.hidden;
  get("open-search").setAttribute("aria-expanded", String(!form.hidden));
  if (!form.hidden) get("search").focus();
  else {
    get("search").value = "";
    renderReading();
  }
});
get("search-form").addEventListener("submit", event => event.preventDefault());
get("search").addEventListener("input", renderReading);
get("history-toggle").addEventListener("click", event => {
  const button = event.currentTarget;
  button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
  renderReading();
});
get("details-action").addEventListener("click", () => {
  details.close();
  changeOutcome(shownDetails, !shownDetails.done);
});
get("undo").addEventListener("click", () => {
  lastChange.item.done = lastChange.before;
  const id = lastChange.item.id;
  lastChange = null;
  get("feedback").hidden = true;
  renderReading();
  paintMap();
  const groups = !get("groups-view").hidden;
  if (groups) showGroups(true);
  const view = get(groups ? "groups-view" : "ping-view");
  const target = Array.from(view.querySelectorAll('.item[data-id="' + id + '"] .item-title')).find(button => button.getClientRects().length);
  (target ?? get(groups ? "show-groups" : "show-ping")).focus({ preventScroll: true });
});
get("add").addEventListener("click", () => composer.showModal());
get("cancel-add").addEventListener("click", () => composer.close());
get("item-due").addEventListener("input", () => {
  get("create").firstElementChild.textContent = get("item-due").value ? "add task" : "add reminder";
});
get("compose-form").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const titleInput = get("item-title");
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.setCustomValidity("enter a title.");
    titleInput.reportValidity();
    return;
  }
  const date = get("item-due").value;
  const id = nextId++;
  items.push({ id, title, notes: get("item-notes").value.trim(), group: get("item-group").value,
    due: date ? new Date(date).getTime() : null, angle: id * 2.399963 });
  form.reset();
  get("create").firstElementChild.textContent = "add reminder";
  composer.close();
  get("search").value = "";
  renderReading();
  paintMap();
});
get("item-title").addEventListener("input", event => event.target.setCustomValidity(""));
get("show-ping").addEventListener("click", () => showGroups(false));
get("show-groups").addEventListener("click", () => showGroups(true));

renderReading();
paintMap();
new ResizeObserver(() => { if (!get("ping-view").hidden) paintMap(); }).observe(map);
setInterval(() => {
  const previous = now;
  now = Date.now();
  if (items.some(item => !item.done && item.due > previous && isDue(item))) {
    renderReading();
    if (!get("groups-view").hidden) showGroups(true);
  }
  if (!get("ping-view").hidden) paintMap();
}, 15_000);
