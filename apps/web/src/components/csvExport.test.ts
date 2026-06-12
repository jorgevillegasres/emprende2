import { describe, expect, it } from "vitest";
import { buildCsvFromTable, createExportFilename } from "./csvExport";

describe("csvExport", () => {
  it("escapes values that contain commas, quotes, or line breaks", () => {
    const csv = buildCsvFromTable(
      ["Nombre", "Nota", "Cantidad"],
      [["Jabon, lavanda", "Linea \"A\"\nEspecial", 2]]
    );

    expect(csv).toBe("Nombre,Nota,Cantidad\r\n\"Jabon, lavanda\",\"Linea \"\"A\"\"\nEspecial\",2");
  });

  it("creates stable Emprendedos export filenames", () => {
    const filename = createExportFilename("Historial de lotes producidos", new Date("2026-06-12T10:00:00.000Z"));

    expect(filename).toBe("emprendedos-historial-de-lotes-producidos-2026-06-12.csv");
  });
});
