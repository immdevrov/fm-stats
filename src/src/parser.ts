import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { join } from "path";
import { parsePositions } from "./fields/positions";
import type { Player } from "./types";
import { parseCustomDate } from "./utils";

export function readCsvFile(filePath: string): string {
  try {
    const absolutePath = filePath.startsWith("/")
      ? filePath
      : join(process.cwd(), filePath);
    return readFileSync(absolutePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read CSV file: ${(error as Error).message}`);
  }
}

export function parsePlayerStats(csvContent: string): Player[] {
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    cast: true,
  });

  const processString = (str: string) => {
    return <T extends (s: string) => any>(
      s: string | null,
      processFn: T
    ): ReturnType<T> | null => {
      if (s === null || s === str) {
        return null;
      }
      return processFn(s);
    };
  };
  const processHyphen = processString("-");
  const processNA = processString("N/A");
  const parseWage = (record: any) => {
    const fn = (str: string) =>
      parseInt(str.replaceAll(",", "").replaceAll("€", ""));
    return processNA(record.Wage, fn);
  };
  const processRecord = (record: any) => {
    try {
      return {
        UID: Number(record.UID),
        Name: record.Name,
        Age: Number(record.Age),
        Weight: record.Weight,
        Height: parseInt(record.Height),
        RcInjury: record["Rc Injury"] !== "-",
        Nat: record.Nat,
        Division: record.Division,
        Club: record.Club,
        Wage: parseWage(record),
        Expires:
          record.Expires === "-" ? null : parseCustomDate(record.Expires),
        Position: parsePositions(record.Position),
        SecPosition:
          record["Sec. Position"] !== "-"
            ? parsePositions(record["Sec. Position"])
            : null,
        Starts: Number(record.Starts),
        Mins: Number(
          typeof record.Mins === "string"
            ? record.Mins.replace(",", "")
            : record.Mins
        ),
        PasPercentage: Number(record["Pas %"].replace("%", "")),
        AssistsPer90: Number(record["Asts/90"]),
        xAPer90: Number(record["xA/90"]),
        PrPassesPer90: Number(record["Pr passes/90"]),
        OPKPPer90: Number(record["OP-KP/90"] || 0),
        ChCPer90: Number(record["Ch C/90"] || 0),
        OPCrPercentage: Number((record["OP-Cr %"] || "0").replace("%", "")),
        OPCrsCPer90: Number(record["OP-Crs C/90"] || 0),
        ConvPercentage: Number((record["Conv %"] || "0").replace("%", "")),
        xGOP: Number(record["xG-OP"] || 0),
        ShTPer90: Number(record["ShT/90"]),
        ShotsOutsideBoxPer90: Number(record["Shots Outside Box/90"]),
        NPxGPer90: Number(record["NP-xG/90"]),
        GlMst: Number(record["Gl Mst"]),
        TckPer90: processHyphen(record["Tck/90"], parseFloat),
        TckR: processHyphen(record["Tck R"], parseInt),
        ClrPer90: Number(record["Clr/90"]),
        KTckPer90: Number(record["K Tck/90"]),
        KHdrsPer90: Number(record["K Hdrs/90"]),
        AerAPer90: processHyphen(record["Aer A/90"], parseFloat),
        HdrPercentage: processHyphen(record["Hdr %"], parseInt),
        HdrsWPer90: processHyphen(record["Hdrs W/90"], parseInt),
        BlkPer90: Number(record["Blk/90"]),
        PossWonPer90: Number(record["Poss Won/90"]),
        PossLostPer90: Number(record["Poss Lost/90"]),
        SprintsPer90: Number(record["Sprints/90"]),
        DrbPer90: record["Drb/90"] === "-" ? 0 : Number(record["Drb/90"]),
        DistPer90: record["Dist/90"],
        PresCPer90: Number(record["Pres C/90"]),
        PresAPer90: Number(record["Pres A/90"]),
        Svt: record.Svt === "-" ? 0 : Number(record.Svt),
        Svp: record.Svp === "-" ? 0 : Number(record.Svp),
        Svh: record.Svh === "-" ? 0 : Number(record.Svh),
        xGPPer90: Number(record["xGP/90"]),
      };
    } catch (e) {
      console.error(`Error in ${record.UID}`);
      console.error(e);
    }
  };

  return records.map((record: any) => {
    if (record.Name === "Keenan Samuels") {
      console.log("1");
    }
    return processRecord(record);
  });
}
