// Node Modules
const input = require("input");

// Local Modules 
import buildArchive from "../scripts/build-archive";
import updateArchive from "../scripts/update-archive";
import checkArchive from "../scripts/check-archive";

// Types
type Choice = {
  name: string, 
  value: string,
};

async function main(): Promise<void> {
  const CHOICES: Choice[] = [
    {
      name: "Build Archive", 
      value: "build-archive",
    },
    {
      name: "Update Archive",
      value: "update-archive",
    },
    {
      name: "Check Archive",
      value: "check-archive",
    },
    {
      name: "Quit",
      value: "quit",
    },
  ];

  const choice: string = await input.select(
    "Choose 1 from the following: ", 
    CHOICES, 
    { default: "build-archive" },
  );
  console.log();

  if (choice == "build-archive") await buildArchive();
  else if (choice == "update-archive") await updateArchive();
  else if (choice == "check-archive") await checkArchive();
  else if (choice == "quit") return;
}

main()
  .then(() => process.exit(0));

