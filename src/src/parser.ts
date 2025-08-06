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
      parseInt(str.replaceAll(",", "").replaceAll("€", "").replaceAll("$", ""));
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
        Expires: processHyphen(record.Expires, parseCustomDate),
        Position: parsePositions(record.Position),
        SecPosition: processHyphen(record.Position, parsePositions),
        Starts: Number(record.Starts),
        Mins: Number(
          typeof record.Mins === "string" ? record.Mins.replace(",", "") : record.Mins
        ),
        PasPercentage: Number(record["Pas %"].replace("%", "")),
        AssistsPer90: Number(record["Asts/90"]),
        xAPer90: Number(record["xA/90"]),
        PrPassesPer90: Number(record["Pr passes/90"]),
        OPKPPer90: Number(record["OP-KP/90"] || 0),
        ChCPer90: processHyphen(record["Ch C/90"], parseFloat) ?? 0,
        OPCrPercentage: processHyphen(record["OP-Cr %"], parseFloat) ?? 0,
        OPCrsCPer90: processHyphen(record["OP-Crs C/90"], parseFloat) ?? 0,
        ConvPercentage: processHyphen(record["Conv %"], parseFloat) ?? 0,
        xGOP: Number(record["xG-OP"] || 0),
        ShTPer90: Number(record["ShT/90"]),
        ShotsOutsideBoxPer90: Number(record["Shots Outside Box/90"]),
        NPxGPer90: Number(record["NP-xG/90"]),
        goals90: processHyphen(record["Gls/90"], parseFloat),
        GlMst: processHyphen(record["Gl Mst"], parseInt) ?? 0,
        TckPer90: processHyphen(record["Tck/90"], parseFloat),
        TckR: processHyphen(record["Tck R"], parseFloat) ?? 0,
        ClrPer90: processHyphen(record["Clr/90"], parseFloat) ?? 0,
        KTckPer90: processHyphen(record["K Tck/90"], parseFloat) ?? 0,
        KHdrsPer90: processHyphen(record["K Hdrs/90"], parseFloat) ?? 0,
        AerAPer90: processHyphen(record["Aer A/90"], parseFloat) ?? 0,
        HdrPercentage: processHyphen(record["Hdr %"], parseFloat) ?? 0,
        HdrsWPer90: processHyphen(record["Hdrs W/90"], parseFloat) ?? 0,
        BlkPer90: processHyphen(record["Blk/90"], parseFloat) ?? 0,
        PossWonPer90: processHyphen(record["Poss Won/90"], parseFloat) ?? 0,
        PossLostPer90: processHyphen(record["Poss Lost/90"], parseFloat) ?? 0,
        SprintsPer90: processHyphen(record["Sprints/90"], parseFloat) ?? 0,
        DrbPer90: processHyphen(record["Drb/90"], parseFloat) ?? 0,
        DistPer90: processHyphen(record["Dist/90"], parseFloat) ?? 0,
        PresCPer90: processHyphen(record["Pres C/90"], parseFloat) ?? 0,
        PresAPer90: processHyphen(record["Pres A/90"], parseFloat) ?? 0,
        Svt: processHyphen(record["Svt"], parseFloat) ?? 0,
        Svp: processHyphen(record["Svp"], parseFloat) ?? 0,
        Svh: processHyphen(record["Svh"], parseFloat) ?? 0,
        exsvPercentage: Number(record["xSv %"].replace("%", "")),
        svPercentage: Number(record["Sv %"].replace("%", "")),
        xGPPer90: processHyphen(record["xGP/90"], parseFloat) ?? 0,
      };
    } catch (e) {
      console.error(`Error in ${record.UID}`);
      console.error(e);
    }
  };

  return records.map((record: any) => {
    return processRecord(record);
  });
}
