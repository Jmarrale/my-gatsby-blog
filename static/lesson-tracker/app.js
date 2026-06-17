/* Jiu-Jitsu Lesson Tracker — web demo
 * Vanilla JS, no dependencies. Data persists in the browser via localStorage.
 * Mirrors the SwiftUI app: Today / Clients / Schedule / Payments.
 */
(function () {
  "use strict";

  // ---------- Constants ----------
  const STORE_KEY = "jjlt.v1";
  const BELTS = ["White", "Blue", "Purple", "Brown", "Black"];
  const BELT_COLOR = { White: "#dcdce1", Blue: "#2b78e4", Purple: "#8944c4", Brown: "#7a4a2b", Black: "#1c1c1e" };
  const BELT_TEXT = { White: "#1c1c1e", Blue: "#fff", Purple: "#fff", Brown: "#fff", Black: "#fff" };
  const STATUSES = ["Scheduled", "Completed", "Cancelled", "No-show"];
  const STATUS_COLOR = { Scheduled: "#2b78e4", Completed: "#2e9e54", Cancelled: "#e88b2a", "No-show": "#e0483d" };
  const METHODS = ["Cash", "Card", "Bank transfer", "Venmo", "PayPal", "Other"];

  // ---------- Helpers ----------
  const fmtMoney = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const money = (n) => fmtMoney.format(Number(n) || 0);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  function duration(min) {
    min = Number(min) || 0;
    if (min < 60) return min + " min";
    const h = Math.floor(min / 60), m = min % 60;
    return m === 0 ? h + " hr" : h + " hr " + m + " min";
  }
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function dayDiff(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }
  function relativeDay(d) {
    const diff = dayDiff(d, new Date());
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    return new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }
  function fmtTime(d) { return new Date(d).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); }
  function fmtDay(d) { return new Date(d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }); }
  function fmtMonthYear(d) { return new Date(d).toLocaleDateString(undefined, { month: "long", year: "numeric" }); }
  function isToday(d) { return dayDiff(d, new Date()) === 0; }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function toLocalInput(d) {
    const x = new Date(d);
    return x.getFullYear() + "-" + pad2(x.getMonth() + 1) + "-" + pad2(x.getDate()) + "T" + pad2(x.getHours()) + ":" + pad2(x.getMinutes());
  }
  function toDateInput(d) {
    const x = new Date(d);
    return x.getFullYear() + "-" + pad2(x.getMonth() + 1) + "-" + pad2(x.getDate());
  }
  function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    const s = parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
    return s || "?";
  }

  // ---------- Data layer ----------
  let db = load();
  let view = { tab: "today", clientId: null, scheduleScope: "upcoming" };

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    const seeded = seed();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(seeded)); } catch (e) {}
    return seeded;
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) {}
  }

  function seed() {
    const today = startOfDay(new Date());
    const day = (off, h = 17, m = 0) => {
      const d = new Date(today); d.setDate(d.getDate() + off); d.setHours(h, m, 0, 0); return d.toISOString();
    };
    const monthsAgo = (n) => { const d = new Date(today); d.setMonth(d.getMonth() - n); return d.toISOString(); };
    const yearsAgo = (n) => { const d = new Date(today); d.setFullYear(d.getFullYear() - n); return d.toISOString(); };

    const alex = { id: uid(), name: "Alex Costa", belt: "Blue", stripes: 2, email: "alex.costa@example.com", phone: "555-0142", startDate: monthsAgo(14), notes: "Competing at the next local open. Working takedowns.", isActive: true, rate: 80 };
    const maria = { id: uid(), name: "Maria Santos", belt: "White", stripes: 3, email: "maria.s@example.com", phone: "555-0188", startDate: monthsAgo(5), notes: "Focus on fundamentals and confidence. Prefers morning sessions.", isActive: true, rate: 70 };
    const jordan = { id: uid(), name: "Jordan Lee", belt: "Purple", stripes: 0, email: "jordan.lee@example.com", phone: "555-0119", startDate: yearsAgo(4), notes: "Advanced. Drilling competition-specific scenarios.", isActive: true, rate: 95 };

    const L = (clientId, date, status, location, techniques, rate, notes) =>
      ({ id: uid(), clientId, date, durationMinutes: 60, status, location, techniques: techniques || "", notes: notes || "", rate });
    const P = (clientId, date, amount, method, lessonsCovered, note) =>
      ({ id: uid(), clientId, date, amount, method, lessonsCovered, note: note || "" });

    return {
      clients: [alex, maria, jordan],
      lessons: [
        L(alex.id, day(-18), "Completed", "Main mat", "Single leg, sprawl defense", 80),
        L(alex.id, day(-11), "Completed", "Main mat", "Guard retention, hip escape", 80),
        L(alex.id, day(-4), "Completed", "Main mat", "Knee cut pass, underhook", 80),
        L(alex.id, day(2), "Scheduled", "Main mat", "Leg drag, back takes", 80),
        L(alex.id, day(9), "Scheduled", "Main mat", "", 80),
        L(maria.id, day(-7, 9), "Completed", "Studio B", "Mount escapes, bridge & roll", 70),
        L(maria.id, day(1, 9), "Scheduled", "Studio B", "Closed guard basics", 70),
        L(jordan.id, day(-25), "Completed", "Main mat", "Berimbolo, leg lock entries", 95),
        L(jordan.id, day(-12), "Completed", "Main mat", "Pressure passing", 95),
        L(jordan.id, day(-3), "No-show", "Main mat", "", 95, "Did not show — follow up."),
        L(jordan.id, day(3, 18), "Scheduled", "Main mat", "Comp simulation rounds", 95),
      ],
      payments: [
        P(alex.id, day(-20), 800, "Card", 10, "10-lesson package"),
        P(maria.id, day(-7), 70, "Cash", 1, "Single lesson"),
        P(jordan.id, day(-30), 475, "Bank transfer", 5, "5-lesson package"),
      ],
    };
  }

  // ---------- Derived ----------
  const clientById = (id) => db.clients.find((c) => c.id === id);
  const lessonsFor = (id) => db.lessons.filter((l) => l.clientId === id);
  const paymentsFor = (id) => db.payments.filter((p) => p.clientId === id);
  const completedFor = (id) => lessonsFor(id).filter((l) => l.status === "Completed");
  function upcomingFor(id) {
    const t = startOfDay(new Date());
    return lessonsFor(id).filter((l) => l.status === "Scheduled" && new Date(l.date) >= t).sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  const prepaidFor = (id) => paymentsFor(id).reduce((s, p) => s + (Number(p.lessonsCovered) || 0), 0);
  const remainingFor = (id) => prepaidFor(id) - completedFor(id).length;
  const totalPaidFor = (id) => paymentsFor(id).reduce((s, p) => s + (Number(p.amount) || 0), 0);
  function balanceFor(id) {
    const c = clientById(id);
    const owedLessons = Math.max(0, -remainingFor(id));
    return owedLessons * (Number(c.rate) || 0);
  }

  // ---------- Component HTML ----------
  function beltBadge(belt, stripes) {
    const bg = BELT_COLOR[belt] || "#ccc", fg = BELT_TEXT[belt] || "#fff";
    let dots = "";
    if (stripes > 0) {
      dots = '<span class="stripes">' + Array.from({ length: Math.min(stripes, 4) }).map(() => '<span class="dot"></span>').join("") + "</span>";
    }
    return '<span class="belt" style="background:' + bg + ";color:" + fg + '">' + esc(belt) + dots + "</span>";
  }
  function avatar(client, lg) {
    const bg = BELT_COLOR[client.belt] || "#ccc", fg = BELT_TEXT[client.belt] || "#fff";
    return '<div class="avatar' + (lg ? " lg" : "") + '" style="background:' + bg + ";color:" + fg + '">' + esc(initials(client.name)) + "</div>";
  }
  function statusBadge(status) {
    const col = STATUS_COLOR[status] || "#888";
    return '<span class="status" style="color:' + col + '"><span class="bullet"></span>' + esc(status) + "</span>";
  }
  function tile(label, value, color, icon) {
    return '<div class="tile"><div class="icon" style="color:' + (color || "var(--accent)") + '">' + icon + '</div>' +
      '<div class="val">' + esc(value) + '</div><div class="lbl">' + esc(label) + "</div></div>";
  }
  function lessonRow(l, opts) {
    opts = opts || {};
    const c = clientById(l.clientId);
    const col = STATUS_COLOR[l.status] || "#888";
    const techs = String(l.techniques || "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const sub = techs.length ? techs.join(" • ") : (l.location ? "📍 " + l.location : "");
    const title = opts.showClient === false ? (sub || "Lesson") : (c ? c.name : "No client");
    const meta = opts.showClient === false ? "" : sub;
    const completeBtn = (opts.allowComplete && l.status === "Scheduled")
      ? '<button class="btn small icon" data-action="complete" data-id="' + l.id + '" title="Mark completed">✓</button>' : "";
    return '<li class="row" data-action="editLesson" data-id="' + l.id + '">' +
      '<div class="lesson-time"><div class="t">' + fmtTime(l.date) + '</div><div class="d">' + duration(l.durationMinutes) + "</div></div>" +
      '<div class="accent-bar" style="background:' + col + '"></div>' +
      '<div class="grow"><div class="title">' + esc(title) + "</div>" +
      (meta ? '<div class="meta">' + esc(meta) + "</div>" : "") + "</div>" +
      '<div class="pill-row">' + statusBadge(l.status) + completeBtn + "</div></li>";
  }
  function paymentRow(p, showClient) {
    const c = clientById(p.clientId);
    const sub = new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
      (p.lessonsCovered > 0 ? " · " + p.lessonsCovered + " lesson" + (p.lessonsCovered === 1 ? "" : "s") : "");
    return '<li class="row" data-action="editPayment" data-id="' + p.id + '">' +
      '<div class="grow"><div class="title">' + esc(showClient === false ? sub : (c ? c.name : "—")) + "</div>" +
      (showClient === false ? (p.note ? '<div class="meta">' + esc(p.note) + "</div>" : "") :
        '<div class="meta">' + esc(sub) + (p.note ? " · " + esc(p.note) : "") + "</div>") +
      "</div>" +
      '<div class="right" style="color:var(--green);font-weight:700">' + money(p.amount) + "</div></li>";
  }
  function emptyState(icon, title, msg, btn) {
    return '<div class="empty"><div class="big">' + icon + '</div><h3>' + esc(title) + "</h3>" +
      '<p class="muted">' + esc(msg) + "</p>" + (btn || "") + "</div>";
  }
  function group(items, keyFn) {
    const map = new Map();
    items.forEach((it) => { const k = keyFn(it); if (!map.has(k)) map.set(k, []); map.get(k).push(it); });
    return map;
  }

  // ---------- Views ----------
  function viewToday() {
    const today = db.lessons.filter((l) => isToday(l.date)).sort((a, b) => new Date(a.date) - new Date(b.date));
    const week = db.lessons.filter((l) => { const diff = dayDiff(l.date, new Date()); return diff >= 0 && diff < 7; }).length;
    const active = db.clients.filter((c) => c.isActive).length;
    const now = new Date();
    const revenue = db.payments.filter((p) => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, p) => s + p.amount, 0);

    let html = '<div class="content">';
    html += '<div class="section"><div class="stats four">' +
      tile("Today", today.length, "var(--blue)", "📅") +
      tile("This week", week, "var(--indigo)", "🗓️") +
      tile("Active clients", active, "var(--purple)", "🥋") +
      tile("Revenue (mo.)", money(revenue), "var(--green)", "💵") +
      "</div></div>";

    html += '<div class="section"><div class="section-head"><h2>Today\'s Lessons</h2></div>';
    if (today.length === 0) {
      html += '<div class="card pad muted">✓ No lessons scheduled today.</div>';
    } else {
      html += '<ul class="list card">' + today.map((l) => lessonRow(l, { allowComplete: true })).join("") + "</ul>";
    }
    html += "</div></div>";
    return html;
  }

  function viewClients() {
    const q = (view.search || "").toLowerCase();
    let clients = db.clients.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (q) clients = clients.filter((c) => c.name.toLowerCase().includes(q));
    const active = clients.filter((c) => c.isActive);
    const inactive = clients.filter((c) => !c.isActive);

    let html = '<div class="content">';
    html += '<div class="field" style="margin-bottom:14px"><input type="search" placeholder="Search clients" value="' + esc(view.search || "") + '" data-action="searchClients"></div>';

    if (db.clients.length === 0) {
      html += emptyState("🥋", "No clients yet", "Add your first private-lesson student to get started.",
        '<button class="btn primary" data-action="addClient">Add Client</button>');
      return html + "</div>";
    }
    const section = (label, list) => {
      if (!list.length) return "";
      return '<div class="section"><div class="section-head"><h2>' + label + "</h2></div>" +
        '<ul class="list card">' + list.map(clientRowHtml).join("") + "</ul></div>";
    };
    html += section("Active", active) + section("Inactive", inactive);
    return html + "</div>";
  }

  function clientRowHtml(c) {
    const next = upcomingFor(c.id)[0];
    return '<li class="row" data-action="openClient" data-id="' + c.id + '">' +
      avatar(c) +
      '<div class="grow"><div class="title">' + esc(c.name) + "</div>" +
      '<div style="margin-top:4px">' + beltBadge(c.belt, c.stripes) + "</div></div>" +
      (next ? '<div class="trail"><div class="muted" style="font-size:11px">Next</div>' + esc(relativeDay(next.date)) + "</div>" : "") +
      "</li>";
  }

  function viewClientDetail() {
    const c = clientById(view.clientId);
    if (!c) { view.tab = "clients"; return viewClients(); }
    const lessons = lessonsFor(c.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    const upcoming = upcomingFor(c.id);
    const payments = paymentsFor(c.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    const remaining = remainingFor(c.id);
    const balance = balanceFor(c.id);

    let html = '<div class="content">';

    // header
    html += '<div class="card pad section">' +
      '<div class="detail-head">' + avatar(c, true) +
      '<div><div class="name">' + esc(c.name) + "</div>" +
      '<div style="margin-top:6px">' + beltBadge(c.belt, c.stripes) + "</div>" +
      '<div class="since">Training since ' + new Date(c.startDate).toLocaleDateString(undefined, { month: "short", year: "numeric" }) + "</div></div></div>";
    const links = [];
    if (c.phone) links.push('<a href="tel:' + esc(c.phone) + '">📞 Call</a>');
    if (c.email) links.push('<a href="mailto:' + esc(c.email) + '">✉️ Email</a>');
    if (links.length) html += '<div class="contact-links">' + links.join("") + "</div>";
    html += "</div>";

    // stats
    html += '<div class="section"><div class="stats three">' +
      tile("Completed", completedFor(c.id).length, "var(--green)", "✅") +
      tile("Prepaid left", remaining, remaining < 0 ? "var(--red)" : "var(--blue)", "🎟️") +
      tile("Balance", money(balance), balance > 0 ? "var(--red)" : "var(--green)", "💲") +
      "</div></div>";

    if (upcoming.length) {
      html += '<div class="section"><div class="section-head"><h2>Upcoming</h2></div>' +
        '<ul class="list card">' + upcoming.map((l) => lessonRow(l, { showClient: false })).join("") + "</ul></div>";
    }

    // lesson log
    html += '<div class="section"><div class="section-head"><h2>Lesson Log</h2>' +
      '<button class="btn small" data-action="addLesson" data-id="' + c.id + '">+ Add</button></div>';
    html += lessons.length
      ? '<ul class="list card">' + lessons.map((l) => lessonRow(l, { showClient: false })).join("") + "</ul>"
      : '<div class="card pad muted">No lessons logged yet.</div>';
    html += "</div>";

    // payments
    html += '<div class="section"><div class="section-head"><h2>Payments</h2>' +
      '<button class="btn small" data-action="addPayment" data-id="' + c.id + '">+ Add</button></div>';
    html += payments.length
      ? '<ul class="list card">' + payments.map((p) => paymentRow(p, false)).join("") + "</ul>"
      : '<div class="card pad muted">No payments recorded.</div>';
    html += "</div>";

    if (c.notes) {
      html += '<div class="section"><div class="section-head"><h2>Notes</h2></div>' +
        '<div class="card pad notes-text">' + esc(c.notes) + "</div></div>";
    }

    return html + "</div>";
  }

  function viewSchedule() {
    const t0 = startOfDay(new Date());
    const scope = view.scheduleScope;
    let lessons = db.lessons.filter((l) => scope === "upcoming" ? new Date(l.date) >= t0 : new Date(l.date) < t0);
    lessons.sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = '<div class="content">';
    html += '<div class="section center"><div class="segment">' +
      '<button class="' + (scope === "upcoming" ? "active" : "") + '" data-action="scope" data-id="upcoming">Upcoming</button>' +
      '<button class="' + (scope === "past" ? "active" : "") + '" data-action="scope" data-id="past">Past</button>' +
      "</div></div>";

    if (!lessons.length) {
      html += emptyState("📅", scope === "upcoming" ? "Nothing scheduled" : "No past lessons",
        scope === "upcoming" ? "Use the + button to schedule a lesson." : "Completed and past lessons will appear here.", "");
      return html + "</div>";
    }

    const grouped = group(lessons, (l) => startOfDay(l.date).getTime());
    let keys = Array.from(grouped.keys());
    keys.sort((a, b) => scope === "upcoming" ? a - b : b - a);
    keys.forEach((k) => {
      const dayLessons = grouped.get(k).sort((a, b) => new Date(a.date) - new Date(b.date));
      const rel = relativeDay(k);
      const full = fmtDay(k);
      const header = (rel === "Today" || rel === "Tomorrow" || rel === "Yesterday") ? rel + " · " + full : full;
      html += '<div class="section"><div class="section-head"><h2>' + esc(header) + "</h2></div>" +
        '<ul class="list card">' + dayLessons.map((l) => lessonRow(l, { showClient: true, allowComplete: true })).join("") + "</ul></div>";
    });
    return html + "</div>";
  }

  function viewPayments() {
    const now = new Date();
    const payments = db.payments.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const monthTotal = payments.filter((p) => { const d = new Date(p.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, p) => s + p.amount, 0);
    const allTotal = payments.reduce((s, p) => s + p.amount, 0);

    let html = '<div class="content">';
    if (!payments.length) {
      html += emptyState("💳", "No payments yet", "Record a payment with the + button to start tracking revenue.",
        '<button class="btn primary" data-action="addPayment">Record Payment</button>');
      return html + "</div>";
    }
    html += '<div class="section"><div class="stats">' +
      tile("This month", money(monthTotal), "var(--green)", "📅") +
      tile("All time", money(allTotal), "var(--blue)", "Σ") +
      "</div></div>";

    const grouped = group(payments, (p) => { const d = new Date(p.date); return d.getFullYear() + "-" + pad2(d.getMonth() + 1); });
    const keys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));
    keys.forEach((k) => {
      const list = grouped.get(k);
      html += '<div class="section"><div class="section-head"><h2>' + esc(fmtMonthYear(list[0].date)) + "</h2></div>" +
        '<ul class="list card">' + list.map((p) => paymentRow(p, true)).join("") + "</ul></div>";
    });
    return html + "</div>";
  }

  // ---------- App bar ----------
  function appbar() {
    if (view.tab === "clientDetail") {
      const c = clientById(view.clientId);
      return '<div class="appbar"><button class="back" data-action="back">‹ Clients</button>' +
        '<h1 style="font-size:18px;text-align:center">' + esc(c ? c.name : "Client") + "</h1>" +
        '<button class="btn small" data-action="editClient" data-id="' + view.clientId + '">Edit</button></div>';
    }
    const titles = {
      today: { t: fmtDay(new Date()), sub: "Today" },
      clients: { t: "Clients" },
      schedule: { t: "Schedule" },
      payments: { t: "Payments" },
    };
    const cfg = titles[view.tab] || { t: "" };
    let action = "";
    if (view.tab === "clients") action = '<button class="btn icon primary" data-action="addClient">＋</button>';
    if (view.tab === "schedule" || view.tab === "today") action = '<button class="btn icon primary" data-action="addLesson">＋</button>';
    if (view.tab === "payments") action = '<button class="btn icon primary" data-action="addPayment">＋</button>';
    return '<div class="appbar"><h1>' + esc(cfg.t) + (cfg.sub ? '<span class="sub">' + esc(cfg.sub) + "</span>" : "") + "</h1>" + action + "</div>";
  }

  function tabbar() {
    const tabs = [
      { id: "today", ic: "☀️", label: "Today" },
      { id: "clients", ic: "👥", label: "Clients" },
      { id: "schedule", ic: "📅", label: "Schedule" },
      { id: "payments", ic: "💳", label: "Payments" },
    ];
    const activeTab = view.tab === "clientDetail" ? "clients" : view.tab;
    return '<nav class="tabbar">' + tabs.map((t) =>
      '<button class="tab ' + (activeTab === t.id ? "active" : "") + '" data-action="tab" data-id="' + t.id + '">' +
      '<span class="ic">' + t.ic + "</span>" + t.label + "</button>").join("") + "</nav>";
  }

  // ---------- Render ----------
  function render() {
    let body;
    switch (view.tab) {
      case "today": body = viewToday(); break;
      case "clients": body = viewClients(); break;
      case "clientDetail": body = viewClientDetail(); break;
      case "schedule": body = viewSchedule(); break;
      case "payments": body = viewPayments(); break;
      default: body = viewToday();
    }
    document.getElementById("app").innerHTML = appbar() + body + tabbar();
  }

  // ---------- Modals / forms ----------
  function closeModal() {
    const m = document.getElementById("modal-root");
    if (m) m.innerHTML = "";
  }
  function modal(title, innerHtml, onSubmit, extraActions) {
    const root = document.getElementById("modal-root");
    root.innerHTML =
      '<div class="modal-backdrop" id="backdrop"><div class="modal">' +
      '<div class="modal-bar"><button class="btn ghost" data-close>Cancel</button>' +
      "<h2>" + esc(title) + "</h2>" +
      '<button class="btn ghost" form="modal-form" type="submit" style="color:var(--accent);font-weight:700">Save</button></div>' +
      '<form id="modal-form">' + innerHtml +
      (extraActions || "") + "</form></div></div>";
    const form = document.getElementById("modal-form");
    form.addEventListener("submit", function (e) { e.preventDefault(); onSubmit(new FormData(form)); });
    root.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
    document.getElementById("backdrop").addEventListener("click", function (e) {
      if (e.target.id === "backdrop") closeModal();
    });
  }

  function field(label, name, value, type, attrs) {
    return '<div class="field"><label>' + esc(label) + "</label>" +
      '<input name="' + name + '" type="' + (type || "text") + '" value="' + esc(value == null ? "" : value) + '" ' + (attrs || "") + "></div>";
  }
  function selectField(label, name, options, selected) {
    return '<div class="field"><label>' + esc(label) + "</label><select name=\"" + name + "\">" +
      options.map((o) => '<option value="' + esc(o) + '"' + (o === selected ? " selected" : "") + ">" + esc(o) + "</option>").join("") +
      "</select></div>";
  }
  function textareaField(label, name, value) {
    return '<div class="field"><label>' + esc(label) + "</label><textarea name=\"" + name + "\">" + esc(value || "") + "</textarea></div>";
  }
  function deleteAction(action, id, label) {
    return '<div class="field"><button type="button" class="btn ghost danger" style="width:100%" data-action="' + action + '" data-id="' + id + '">' + esc(label) + "</button></div>";
  }

  // Client form
  function clientForm(existing) {
    const c = existing || { name: "", belt: "White", stripes: 0, email: "", phone: "", startDate: new Date().toISOString(), notes: "", isActive: true, rate: 0 };
    const inner =
      field("Full name", "name", c.name, "text", 'autocapitalize="words" required') +
      '<div class="field-row">' + selectField("Belt", "belt", BELTS, c.belt) +
      field("Stripes", "stripes", c.stripes, "number", 'min="0" max="4"') + "</div>" +
      field("Training since", "startDate", toDateInput(c.startDate), "date") +
      '<div class="field toggle-row"><label style="margin:0">Active client</label><input type="checkbox" name="isActive" ' + (c.isActive ? "checked" : "") + ' style="width:auto"></div>' +
      '<div class="field-row">' + field("Email", "email", c.email, "email") + field("Phone", "phone", c.phone, "tel") + "</div>" +
      field("Default lesson rate", "rate", c.rate, "number", 'min="0" step="0.01"') +
      textareaField("Notes (goals, injuries, preferences…)", "notes", c.notes);
    modal(existing ? "Edit Client" : "New Client", inner, function (fd) {
      const obj = {
        name: (fd.get("name") || "").trim(), belt: fd.get("belt"), stripes: parseInt(fd.get("stripes")) || 0,
        startDate: new Date(fd.get("startDate") || Date.now()).toISOString(), isActive: fd.get("isActive") === "on",
        email: fd.get("email") || "", phone: fd.get("phone") || "", rate: parseFloat(fd.get("rate")) || 0, notes: fd.get("notes") || "",
      };
      if (!obj.name) return;
      if (existing) { Object.assign(existing, obj); }
      else { obj.id = uid(); db.clients.push(obj); }
      save(); closeModal(); render();
    }, existing ? deleteAction("deleteClient", existing.id, "Delete Client") : "");
  }

  // Lesson form
  function lessonForm(existing, presetClientId) {
    if (!db.clients.length) { alert("Add a client first."); return; }
    const l = existing || { clientId: presetClientId || db.clients[0].id, date: new Date().toISOString(), durationMinutes: 60, status: "Scheduled", location: "", techniques: "", notes: "", rate: 0 };
    const clientOpts = db.clients.map((c) => '<option value="' + c.id + '"' + (c.id === l.clientId ? " selected" : "") + ">" + esc(c.name) + "</option>").join("");
    const inner =
      '<div class="field"><label>Client</label><select name="clientId">' + clientOpts + "</select></div>" +
      field("Date & time", "date", toLocalInput(l.date), "datetime-local") +
      '<div class="field-row">' +
      selectField("Duration", "durationMinutes", ["30", "45", "60", "75", "90", "120"], String(l.durationMinutes)) +
      selectField("Status", "status", STATUSES, l.status) + "</div>" +
      field("Location", "location", l.location, "text") +
      textareaField("Techniques (comma separated)", "techniques", l.techniques) +
      field("Rate", "rate", l.rate, "number", 'min="0" step="0.01"') +
      textareaField("Notes", "notes", l.notes);
    modal(existing ? "Edit Lesson" : "New Lesson", inner, function (fd) {
      const obj = {
        clientId: fd.get("clientId"), date: new Date(fd.get("date")).toISOString(),
        durationMinutes: parseInt(fd.get("durationMinutes")) || 60, status: fd.get("status"),
        location: fd.get("location") || "", techniques: fd.get("techniques") || "", notes: fd.get("notes") || "",
        rate: parseFloat(fd.get("rate")) || 0,
      };
      if (existing) { Object.assign(existing, obj); }
      else { obj.id = uid(); db.lessons.push(obj); }
      save(); closeModal(); render();
    }, existing ? deleteAction("deleteLesson", existing.id, "Delete Lesson") : "");
  }

  // Payment form
  function paymentForm(existing, presetClientId) {
    if (!db.clients.length) { alert("Add a client first."); return; }
    const p = existing || { clientId: presetClientId || db.clients[0].id, date: new Date().toISOString(), amount: 0, method: "Cash", lessonsCovered: 1, note: "" };
    const clientOpts = db.clients.map((c) => '<option value="' + c.id + '"' + (c.id === p.clientId ? " selected" : "") + ">" + esc(c.name) + "</option>").join("");
    const inner =
      '<div class="field"><label>Client</label><select name="clientId">' + clientOpts + "</select></div>" +
      '<div class="field-row">' + field("Amount", "amount", p.amount, "number", 'min="0" step="0.01" required') +
      field("Date", "date", toDateInput(p.date), "date") + "</div>" +
      '<div class="field-row">' + selectField("Method", "method", METHODS, p.method) +
      field("Lessons covered", "lessonsCovered", p.lessonsCovered, "number", 'min="0" max="100"') + "</div>" +
      field("Note", "note", p.note, "text");
    modal(existing ? "Edit Payment" : "Record Payment", inner, function (fd) {
      const obj = {
        clientId: fd.get("clientId"), date: new Date(fd.get("date")).toISOString(),
        amount: parseFloat(fd.get("amount")) || 0, method: fd.get("method"),
        lessonsCovered: parseInt(fd.get("lessonsCovered")) || 0, note: fd.get("note") || "",
      };
      if (obj.amount <= 0) return;
      if (existing) { Object.assign(existing, obj); }
      else { obj.id = uid(); db.payments.push(obj); }
      save(); closeModal(); render();
    }, existing ? deleteAction("deletePayment", existing.id, "Delete Payment") : "");
  }

  // ---------- Event handling ----------
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.getAttribute("data-action");
    const id = el.getAttribute("data-id");

    switch (action) {
      case "tab": view.tab = id; view.clientId = null; window.scrollTo(0, 0); render(); break;
      case "back": view.tab = "clients"; view.clientId = null; render(); break;
      case "openClient": view.tab = "clientDetail"; view.clientId = id; window.scrollTo(0, 0); render(); break;
      case "scope": view.scheduleScope = id; render(); break;
      case "addClient": clientForm(null); break;
      case "editClient": clientForm(clientById(id)); break;
      case "addLesson": lessonForm(null, view.tab === "clientDetail" ? view.clientId : id); break;
      case "editLesson": lessonForm(db.lessons.find((l) => l.id === id)); break;
      case "addPayment": paymentForm(null, view.tab === "clientDetail" ? view.clientId : id); break;
      case "editPayment": paymentForm(db.payments.find((p) => p.id === id)); break;
      case "complete": {
        const l = db.lessons.find((x) => x.id === id);
        if (l) { l.status = "Completed"; save(); render(); }
        break;
      }
      case "deleteClient":
        if (confirm("Delete this client and all their lessons and payments?")) {
          db.clients = db.clients.filter((c) => c.id !== id);
          db.lessons = db.lessons.filter((l) => l.clientId !== id);
          db.payments = db.payments.filter((p) => p.clientId !== id);
          save(); closeModal(); view.tab = "clients"; view.clientId = null; render();
        }
        break;
      case "deleteLesson":
        db.lessons = db.lessons.filter((l) => l.id !== id); save(); closeModal(); render(); break;
      case "deletePayment":
        db.payments = db.payments.filter((p) => p.id !== id); save(); closeModal(); render(); break;
    }
  });

  document.addEventListener("input", function (e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    if (el.getAttribute("data-action") === "searchClients") {
      view.search = el.value;
      // Re-render the view, then restore focus + caret to the search field.
      const pos = el.selectionStart;
      render();
      const again = document.querySelector('[data-action="searchClients"]');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (x) {} }
    }
  });

  // ---------- Boot ----------
  render();
})();
