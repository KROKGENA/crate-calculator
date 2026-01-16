// ТВОИ ТОЧНЫЕ МАТЕРИАЛЫ (мм и количество)
const PARTS = [
  { name: "Доска обрезная 20×100×3110", T: 20, W: 100, L: 3110, qty: 10 },
  { name: "Доска обрезная 20×100×1360", T: 20, W: 100, L: 1360, qty: 11 },
  { name: "Доска обрезная 30×120×3050", T: 30, W: 120, L: 3050, qty: 2 },
  { name: "Доска обрезная 30×120×1360", T: 30, W: 120, L: 1360, qty: 2 },
  { name: "Брус 100×100×150",           T: 100, W: 100, L: 150,  qty: 15 },
];

const $ = (id) => document.getElementById(id);

function volumeM3(T, W, L) {
  // мм -> м: делим на 1000
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
  return Number($(id).value || 0);
}

function render() {
  const woodPrice = readNum("woodPrice");      // ₽/м³
  const wastePct  = readNum("wastePct");       // %
  const wasteK    = 1 + wastePct / 100;

  const cornerPrice = readNum("cornerPrice");  // ₽/шт
  const cornerQty   = readNum("cornerQty");    // шт

  const nailPrice = readNum("nailPrice");      // ₽/кг
  const nailKg    = readNum("nailKg");         // кг

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

  const metalCost = cornerPrice * cornerQty;
  const nailCost = nailPrice * nailKg;
  const total = woodCost + metalCost + nailCost;

  $("woodVolNet").textContent = round(woodVolNet, 6);
  $("woodVolGross").textContent = round(woodVolGross, 6);
  $("woodCost").textContent = money(woodCost);

  $("metalCost").textContent = money(metalCost);
  $("nailCost").textContent = money(nailCost);

  $("totalCost").textContent = money(total);
}

function setup() {
  ["woodPrice","wastePct","cornerPrice","cornerQty","nailPrice","nailKg"]
    .forEach((id) => $(id).addEventListener("input", render));
  render();
}

setup();
