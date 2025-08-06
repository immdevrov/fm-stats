import * as fs from "fs";
import * as path from "path";

/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert
 * @returns CSV string
 */
function arrayToCSV<T extends Record<string, any>>(data: T[]): string {
  if (data.length === 0) {
    return "";
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);

  // Create header row
  const headerRow = headers.join(",");

  // Create data rows
  const dataRows = data.map((obj) =>
    headers
      .map((header) => {
        const value = obj[header];
        // Handle values that might contain commas, quotes, or newlines
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"') || value.includes("\n"))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (Array.isArray(value)) {
          return value.join(";");
        }
        if (Object.prototype.toString.call(value) === "[object Object]") {
          return JSON.stringify(value).replaceAll(",", ";");
        }
        return value;
      })
      .join(",")
  );

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Saves CSV data to a file
 * @param csvData CSV string content
 * @param filename Output filename
 * @param outputDir Output directory (optional, defaults to current directory)
 */
async function saveCSVToFile(
  csvData: string,
  filename: string,
  outputDir: string = "./"
): Promise<void> {
  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, filename);

    // Write the CSV data to file
    await fs.promises.writeFile(filePath, csvData, "utf8");

    console.log(`✅ CSV file saved successfully: ${filePath}`);
    console.log(`📊 Total records: ${csvData.split("\n").length - 1}`);
  } catch (error) {
    console.error("❌ Error saving CSV file:", error);
    throw error;
  }
}

export { arrayToCSV, saveCSVToFile };
