import { filterByContractExpiryDate } from "./fields/expires";
import { readCsvFile, parsePlayerStats } from "./parser";
import { CentralDefenderProcessor } from "./roles/central-defender";
import { FullbackProcessor } from "./roles/fullback";
import { GoalKeeperProcessor } from "./roles/goalkeeper";
import { StrikersProcessor } from "./roles/striker";

function getCurrentDateFromFilePath(filePath: string) {
  const dateRegex = /(\d{2}_\d{2}_\d{4})\.csv$/;
  const match = filePath.match(dateRegex);
  if (!match) {
    console.error("No date found in the string, taking current date");
    return new Date();
  }
  const dateString = match[1];

  const [day, month, year] = dateString.split("_").map(Number);
  return new Date(year, month - 1, day);
}

function main() {
  try {
    // Get the file path from command line arguments
    const filePath = process.argv[2];

    if (!filePath) {
      console.error("Please provide a CSV file path as an argument");
      process.exit(1);
    }
    console.log(`Processing filePath ${filePath}`);
    const csvContent = readCsvFile(filePath);
    const players = parsePlayerStats(csvContent);
    console.log(`Successfully loaded ${players.length} players`);

    const date = getCurrentDateFromFilePath(filePath);
    const dateFilteredPlayers = filterByContractExpiryDate({
      players,
      currentDate: date,
      options: "THREE_MONTHS",
    });
    console.log(`${dateFilteredPlayers.length} players on short contract`);

    const cdProcessor = new CentralDefenderProcessor(dateFilteredPlayers);
    cdProcessor.print(cdProcessor.filter());
    const gkProcessor = new GoalKeeperProcessor(dateFilteredPlayers);
    gkProcessor.print(gkProcessor.filter());
    const stProcessor = new StrikersProcessor(dateFilteredPlayers);
    stProcessor.print(stProcessor.filter());
    const fbProcessor = new FullbackProcessor(dateFilteredPlayers);
    fbProcessor.print(fbProcessor.filter());
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
