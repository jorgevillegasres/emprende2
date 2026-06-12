type CsvCell = string | number | boolean | null | undefined;

export function buildCsvFromTable(headers: string[], rows: CsvCell[][]) {
  return [headers, ...rows]
    .map((row) => row.map(formatCsvCell).join(","))
    .join("\r\n");
}

export function createExportFilename(label: string, date = new Date()) {
  const datePart = date.toISOString().slice(0, 10);
  const safeLabel = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "datos";

  return `emprendedos-${safeLabel}-${datePart}.csv`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatCsvCell(value: CsvCell) {
  const rawValue = value == null ? "" : String(value);
  if (!/[",\r\n]/.test(rawValue)) return rawValue;

  return `"${rawValue.replace(/"/g, "\"\"")}"`;
}
