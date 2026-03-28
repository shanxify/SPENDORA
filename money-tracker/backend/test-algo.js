function parseBlock(block) {
    const timeMatch = block.match(/\b(\d{1,2}:\d{2}\s+(am|pm))\b/i);
    const typeMatch = block.match(/\b(DEBIT|CREDIT)\b/i);
    const amountMatch = block.match(/?\s*([\d,]+(?:\.\d{1,2})?)/);
    const utrMatch = block.match(/UTR No\.?\s*(\d+)/i);
    const txnMatch = block.match(/Transaction ID\s+([A-Z0-9]+)/i);
    const actorMatch = block.match(/(?:Paid by|Credited to)\s+[X0-9]+/i);
    const dateMatch = block.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})/i);

    let merchant = block;
    // Replace all extracted known entities with empty string
    merchant = merchant.replace(dateMatch ? dateMatch[0] : '', '');
    merchant = merchant.replace(timeMatch ? timeMatch[0] : '', '');
    merchant = merchant.replace(typeMatch ? typeMatch[0] : '', '');
    merchant = merchant.replace(amountMatch ? amountMatch[0] : '', '');
    merchant = merchant.replace(utrMatch ? utrMatch[0] : '', '');
    merchant = merchant.replace(txnMatch ? txnMatch[0] : '', '');
    merchant = merchant.replace(actorMatch ? actorMatch[0] : '', '');
    
    // Remove "Paid to", "Received from", "Refund from"
    merchant = merchant.replace(/\b(Paid to|Received from|Refund from)\b/i, '');

    // Cleanup extra spaces
    merchant = merchant.replace(/\s{2,}/g, ' ').trim();
    return merchant;
}
console.log('Test 1:', parseBlock('Mar 24, 2026 03:06 pm Paid to Ruchi?? DEBIT ?10 Transaction ID T2603241506018132532500 UTR No. 848678606191 Paid by XXXXXX7038'));
console.log('Test 2:', parseBlock('Mar 14, 2026 10:10 am Paid to DEBIT ?100 THE VELLORE DISTRICT CONSUMERS COOP WHOLESALE STORES LIMITED Transaction ID T2602141010365075099162 UTR No. 122212628189 Paid by XXXXXX7038'));
