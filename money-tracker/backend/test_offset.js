function parseCustomDate(dateStr) {
  const parsed = new Date(dateStr);
  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
}

const fromDate = "2026-03-10";
const toDate = "2026-03-20";

const from = new Date(fromDate);
// Ensure 'from' is at local 00:00:00 avoiding boundary skip
const fromLocal = new Date(
  from.getFullYear(),
  from.getMonth(),
  from.getDate()
);

const to = new Date(toDate);
to.setHours(23, 59, 59, 999);

const toLocal = new Date(
  to.getFullYear(),
  to.getMonth(),
  to.getDate(),
  23, 59, 59, 999
);

const txStr = "2026-03-10";
const txDate = parseCustomDate(txStr);

console.log("From (Raw):", from.toISOString());
console.log("txDate (Raw):", txDate.toISOString());
console.log("txDate >= from (Raw):", txDate >= from); // THIS is the root cause it skips!

console.log("\nIf we use fromLocal Instead:");
console.log("From (Local):", fromLocal.toISOString());
console.log("txDate >= fromLocal (Fixed):", txDate >= fromLocal);
