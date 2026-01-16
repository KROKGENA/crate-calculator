// ТОЧНЫЕ МАТЕРИАЛЫ (мм и количество) НА 1 ЯЩИК
const PARTS = [
  { name: "Доска обрезная 20×100×3110", T: 20,  W: 100, L: 3110, qty: 10 },
  { name: "Доска обрезная 20×100×1360", T: 20,  W: 100, L: 1360, qty: 11 },
  { name: "Доска обрезная 30×120×3050", T: 30,  W: 120, L: 3050, qty: 2  },
  { name: "Доска обрезная 30×120×1360", T: 30,  W: 120, L: 1360, qty: 2  },
  { name: "Брус 100×100×150",           T: 100, W: 100, L: 150,  qty: 15 },
];

const $ = (id) => document.getElementById(id);

function volumeM3(T, W, L) {
  return (T / 1000) * (W / 1000) * (L / 1000);
}

function round(n, digits = 6) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

function money(n) {
  return Math.round(n).toLocaleString("ru-RU");
}

function readNum(id) {
  const el = $(id);
  if (!el) return 0;
  const raw = String(el.value ?? "").trim().replace(",", ".");
  const v = Number(raw);
  return Number.isFinite(v) ? v : 0;
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function render() {
  // Материалы
  const woodPrice = readNum("woodPrice");     // ₽/м³
  const wastePct  = readNum("wastePct");      // %
  const wasteK    = 1 + wastePct / 100;

  const cornerPrice = readNum("cornerPrice"); // ₽/шт
  const cornerQty   = readNum("cornerQty");   // шт

  const nailPrice = readNum("nailPrice");     // ₽/кг
  const nailKg    = readNum("nailKg");        // кг/ящик

  // Работы
  const workerDayRate = readNum("workerDayRate"); // ₽/день
  const boxesPerDay   = Math.max(readNum("boxesPerDay"), 0.000001); // защита от деления на 0
  const workersCount  = readNum("workersCount"); // чел
  const laborPct      = readNum("laborPct"); // %
  const laborFixedPerBox = readNum("laborFixedPerBox"); // ₽/ящик

  // Таблица деталей
  const table = $("partsTable");
  const tbody = table ? table.querySelector("tbody") : null;
  if (tbody) tbody.innerHTML = "";

  let woodVolNet = 0;
  let woodVolGross = 0;
  let woodCost = 0;

  for (const p of PARTS) {
    const v1 = volumeM3(p.T, p.W, p.L);
    const vTot = v1 * p.qty;
    const vGross = vTot * wasteK;
    const cost = vGross * woodPrice;

    woodVolNet += vTot;
    woodVolGross += vGross;
    woodCost += cost;

    if (tbody) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.T}×${p.W}×${p.L}</td>
        <td>${p.qty}</td>
        <td>${round(v1, 6)}</td>
        <td>${round(vTot, 6)}</td>
        <td>${round(vGross, 6)}</td>
        <td>${money(cost)}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  const metalCost = cornerPrice * cornerQty;
  const nailCost = nailPrice * nailKg;

  // Работы: (₽/день * чел / ящиков в день) + фикс, затем надбавка %
  const laborPerBoxBase = (workerDayRate * workersCount) / boxesPerDay;
  const laborBeforePct = laborPerBoxBase + laborFixedPerBox;
  const laborCost = laborBeforePct * (1 + laborPct / 100);

  const total = woodCost + metalCost + nailCost + laborCost;

  // Сводная
  setText("woodVolNet", round(woodVolNet, 6));
  setText("woodVolGross", round(woodVolGross, 6));
  setText("woodCost", money(woodCost));
  setText("metalCost", money(metalCost));
  setText("nailCost", money(nailCost));
  setText("laborCost", money(laborCost));
  setText("totalCost", money(total));
}

function setup() {
  const ids = [
    "woodPrice","wastePct",
    "cornerPrice","cornerQty",
    "nailPrice","nailKg",
    "workerDayRate","boxesPerDay","workersCount","laborPct","laborFixedPerBox"
  ];

  ids.forEach((id) => {
    const el = $(id);
    if (el) el.addEventListener("input", render);
  });

  render();
}

setup();
