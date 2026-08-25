# Healthcare Analytics Dashboard — HTML/CSS/JavaScript

This folder is a web recreation of the supplied Power BI report **Healthcare project.pbix**.

## What was recreated

The PBIX report contains two pages and the following report concepts were reproduced:

- KPI cards for average length of stay, total patients, total billing amount and readmissions
- Department-wise patient count
- Month-wise patient count
- Admissions by patient count
- Billing by insurance provider
- Billing by department
- Doctor vs patient count
- Admissions by type over time
- Department-wise readmissions
- Top medical conditions by billing amount
- Year, gender, admission type and insurance filters
- Two-page navigation
- Responsive layout for desktop/tablet/mobile

## Important data note

The PBIX stores its imported data in Power BI's compressed VertiPaq `DataModel`. The report/layout metadata was readable from the supplied PBIX, but the binary model data was not converted into a browser-ready dataset during this build.

Therefore `app.js` currently generates deterministic demonstration records using the same healthcare fields/categories used by the report. **The displayed numbers are not claimed to be the exact PBIX totals.**

For an exact numerical clone, export the source table from Power BI to CSV and replace the generated dataset in `app.js` with that CSV/JSON data. The chart logic and UI can then be kept unchanged.

## Run

The simplest option is to open `index.html` in a browser.

For local development:

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

## Publish without Power BI

This is a normal static website. It can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

No Power BI Service is required for the website.

## Files

- `index.html` — page structure
- `styles.css` — dashboard styling
- `app.js` — filters, generated data, calculations and Chart.js visualizations

Chart.js is loaded from jsDelivr in `index.html`.
