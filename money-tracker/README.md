# Money Tracker App

A local full-stack web application for tracking personal finances by parsing PhonePe PDF statements.

## Features
- Upload and parse PhonePe PDF transaction statements
- Automatic categorization based on merchant mapping
- Visual dashboard with spending pie chart and monthly bars
- Interactive transaction table with filtering and search
- Zero external dependencies or cloud databases (JSON flat-file storage)

## Prerequisites
- Node.js (v18.x or higher recommended)
- PhonePe Statement PDFs (must contain transaction status, amounts, dates, and UPI Refs)

## Setup

1. From the root directory, run the install script:
   ```bash
   npm run install:all
   ```

2. Start the application:
   ```bash
   npm start
   ```
   This will start both the backend server (port 5001) and the frontend dev server (port 3000) concurrently.

## Usage
1. Open your browser to `http://localhost:3000` (should open automatically).
2. Click on "Upload" in the sidebar and upload a PhonePe PDF.
3. Once processed, you will see a summary of extracted transactions.
4. Go to "Merchant Mapping" to categorize unknown merchants. All historical and future transactions for that merchant will be mapped.
5. Go to the "Dashboard" to view your spending habits and financial summary.

## Troubleshooting
- **PDF Upload Failing:** Ensure your file is a valid PhonePe Statement PDF. The app relies on the specific formatting of these statements.
- **Port Conflicts:** The backend uses port 5001 and frontend uses 3000 by default. If these are in use, the servers may fail to start.
