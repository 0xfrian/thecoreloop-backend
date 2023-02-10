import 'dotenv/config'
import { connect } from '@planetscale/database'

async function main() {
  // Connect to PlanetScale database
  const config: any = {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD
  };

  const connection: any = connect(config);
  const response: any = await connection.execute("SELECT * FROM LAG_ARCHIVE");
  console.log("Response: ", response);
}

main()
  .then(() => process.exit(0));

