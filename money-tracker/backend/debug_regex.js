const MASTER_REGEX = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}:\d{2}\s+(?:am|pm))\s+(DEBIT|CREDIT)\s*₹\s*([\d,]+(?:\.\d{1,2})?)\s*(Paid to|Received from|Refund from)\s+([^₹]+?)(?=\s+(?:DEBIT|CREDIT)\s*₹|\s+Transaction ID|\s+UTR No|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}|$)/gi;

const str = "Mar 07, 2026 08:44 pm CREDIT₹20Received from ABIRAMI MANOJ";
let match;
while ((match = MASTER_REGEX.exec(str)) !== null) {
  console.log("MATCH:", match[0]);
}
console.log("Matches:", match ? "Yes" : "No");
