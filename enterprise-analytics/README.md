# Enterprise Analytics

A simple base analytics dashboard (HTML, CSS, vanilla JavaScript). No build step or dependencies.

## Run
Open `index.html` in any browser.

## Files
- index.html  - page structure
- style.css   - styling (light/dark theme, responsive)
- script.js   - sample data, filters, KPIs, SVG charts, sortable table

## Use your own data
In script.js, replace the DATA generation block with rows shaped like:
{ m: 0-11, region, product, rev, orders, cost }
e.g. const DATA = await fetch('/api/sales').then(r => r.json());
(top-level await needs <script type="module">; or wrap in an async function.)
