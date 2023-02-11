// Node Modules
const input = require("input");

// Local Modules 
import buildArchive from "./build-archive";
import updateArchive from "./update-archive";
import patchArchive from "./patch-archive";
import checkArchive from "./check-archive";

// Types
type Choice = {
  name: string, 
  value: string,
};

async function main(): Promise<void> {
  const CHOICES: Choice[] = [
    {
      name: "Update LAG Archive",
      value: "update-archive",
    },
    {
      name: "Patch LAG(s) in LAG Archive",
      value: "patch-archive",
    },
    {
      name: "Check LAG Archive metadata",
      value: "check-archive",
    },
    {
      name: "Build LAG Archive from scratch [DANGER]", 
      value: "build-archive",
    },
    {
      name: "Quit",
      value: "quit",
    },
  ];

  const choice: string = await input.select(
    "Choose 1 from the following: ", 
    CHOICES, 
    { default: "update-archive" },
  );
  console.log();

  if (choice == "build-archive") {
    // Prompt user for confirmation
    const confirm = await input.confirm("Confirm building LAG Archive from scratch?", { default: false });
    if (!confirm) return;

    await buildArchive();
  }
  else if (choice == "update-archive") await updateArchive();
  else if (choice == "patch-archive") await patchArchive();
  else if (choice == "check-archive") await checkArchive();
  else if (choice == "quit") return;
}

main()
  .then(() => process.exit(0));

