function parseCustomDate(dateStr) {
  if (!dateStr) return new Date(0);
  // Example: "26 Mar 2026"
  if (dateStr.includes(" ")) {
    const [day, monthStr, year] = dateStr.split(" ");
    const monthMap = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
    };
    return new Date(year, monthMap[monthStr], parseInt(day));
  }
  // Safe fallback for standard dates like "2026-03-24"
  return new Date(dateStr + 'T00:00:00');
}

const from = new Date("2026-03-10T00:00:00");
const to = new Date("2026-03-20T23:59:59");
const txDate = parseCustomDate("2026-03-15");

console.log("From:", from.toISOString());
console.log("To:", to.toISOString());
console.log("Tx:", txDate.toISOString());
console.log("Is In Range:", txDate >= from && txDate <= to);

// Wait, the API receives `fromDate` as `2026-03-10`. 
// In javascript, `new Date("2026-03-10")` parses it as UTC time (00:00 UTC).
// Let's test what `new Date("2026-03-10")` gives when printed.
console.log("new Date('2026-03-10') =>", new Date('2026-03-10').toISOString());

// Wait, if I parse using `new Date(dateStr + "T00:00:00")`, it parses as LOCAL time.
console.log("new Date(dateStr + 'T00:00:00') =>", new Date("2026-03-15" + "T00:00:00").toISOString());
