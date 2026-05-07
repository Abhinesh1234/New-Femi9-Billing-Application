import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export interface ExportCol {
  header: string;
  key:    string;
  width?: number;
}

export async function exportToExcelFile(
  filename: string,
  columns:  ExportCol[],
  rows:     Record<string, string | number | null>[],
): Promise<void> {
  const wb    = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet(filename);

  sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width ?? 18 }));

  const headerRow = sheet.getRow(1);
  headerRow.font      = { bold: true, size: 11, color: { argb: "FF1E3A5F" } };
  headerRow.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDBEAFE" } };
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height    = 22;

  for (const row of rows) sheet.addRow(row);

  // Zebra striping on data rows
  sheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowNum % 2 === 0 ? "FFF8FAFF" : "FFFFFFFF" } };
    row.alignment = { vertical: "middle", wrapText: false };
  });

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `${filename}.xlsx`,
  );
}

export function exportToPdfPrint(title: string, headers: string[], rows: string[][]): void {
  const ths = headers.map(h => `<th>${h}</th>`).join("");
  const trs = rows
    .map(r => `<tr>${r.map(c => `<td>${c ?? "—"}</td>`).join("")}</tr>`)
    .join("");

  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title} — Export</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:11px;color:#1e293b;padding:24px}
  h2{font-size:16px;font-weight:700;margin-bottom:4px;color:#1e293b}
  p.meta{font-size:10px;color:#64748b;margin-bottom:16px}
  table{border-collapse:collapse;width:100%}
  th{background:#dbeafe;color:#1e3a5f;font-weight:700;padding:9px 11px;border:1px solid #bfdbfe;text-align:left;font-size:11px;white-space:nowrap}
  td{padding:7px 11px;border:1px solid #e2e8f0;font-size:11px;vertical-align:top;word-break:break-word;white-space:pre-wrap}
  tr:nth-child(even) td{background:#f8faff}
  @media print{@page{size:landscape;margin:1.5cm}body{padding:0}}
</style>
</head>
<body>
  <h2>${title}</h2>
  <p class="meta">Exported on ${dateStr} &nbsp;•&nbsp; ${rows.length} record${rows.length !== 1 ? "s" : ""}</p>
  <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank", "width=1100,height=720");
  if (!win) throw new Error("Popup blocked. Allow popups for this site to use PDF export.");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
