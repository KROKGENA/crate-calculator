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
  // мм -> м
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
  // поддержка запятой 0,6
  const raw = String($(id).value ?? "").trim().replace(",", ".");
  const v = Number(raw);
  return Number.isFinite(v) ? v : 0;
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
  const workerDayRate = readNum("workerDayRate"); // ₽/день за 1 рабочего
  const boxesPerDay   = Math.max(readNum("boxesPerDay"), 0.000001); // защита от деления на 0
  const workersCount  = readNum("workersCount"); // чел
  const laborPct      = readNum("laborPct"); // %
  const laborFixedPerBox = readNum("laborFixedPerBox"); // ₽/ящик

  // Таблица деталей
  const tbody = $("partsTable").querySelector("tbody");
  tbody.innerHTML = "";

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

  // Прочие компоненты
  const metalCost = cornerPrice * cornerQty;
  const nailCost = nailPrice * nailKg;

  // Работы: ставка/день * кол-во рабочих / норма ящиков в день
  const laborPerBoxBase = (workerDayRate * workersCount) / boxesPerDay;
  const laborBeforePct = laborPerBoxBase + laborFixedPerBox;
  const laborCost = laborBeforePct * (1 + laborPct / 100);

  const total = woodCost + metalCost + nailCost + laborCost;

  // Сводная
  $("woodVolNet").textContent = round(woodVolNet, 6);
  $("woodVolGross").textContent = round(woodVolGross, 6);
  $("woodCost").textContent = money(woodCost);

  $("metalCost").textContent = money(metalCost);
  $("nailCost").textContent = money(nailCost);
  $("laborCost").textContent = money(laborCost);

  $("totalCost").textContent = money(total);
}

function setup() {
  const ids = [
    "woodPrice","wastePct",
    "cornerPrice","cornerQty",
    "nailPrice","nailKg",
    "workerDayRate","boxesPerDay","workersCount","laborPct","laborFixedPerBox"
  ];

  ids.forEach((id) => $(id).addEventListener("input", render));
  render();
}

setup();
