// Official MongoDB Docs: https://www.mongodb.com/docs/drivers/node/current/

// Types
import { LAG } from "../types";
import { MongoClient, Collection, Document } from "mongodb";

// Create MongoDB client 
export async function createMongoDBClient(uri: string): Promise<MongoClient> {
  try {
    const client: MongoClient = new MongoClient(uri);
    await client.connect();
    return client;
  } catch (error) {
    throw error;
  }
}

// Get the latest LAG number in Latest_LAG
export async function getLatestLAG(client: MongoClient): Promise<number> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("Latest_LAG");

  const response: any = await lag_collection.findOne({ heading: "Latest LAG"});
  return response.number;
}

// Set the latest LAG number in Latest_LAG
export async function setLatestLAG(client: MongoClient, lag_number: number): Promise<any> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("Latest_LAG");

  const new_latest_lag: any = {
    heading: "Latest LAG",
    number: lag_number,
  };

  const response_update: any = await lag_collection.updateOne({ heading: "Latest LAG" }, { $set: new_latest_lag });
  if (response_update.modifiedCount == 0) {
    const response_insert: any = await lag_collection.insertOne(new_latest_lag);
    return response_insert;
  } else return response_update;
}

// Create/upload a given document (by LAG Number) in LAG_Collection
export async function createLAG(client: MongoClient, lag: LAG): Promise<any> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const response: any = await lag_collection.insertOne(lag)
  return response;
}

// Read a given document (by LAG Number) in LAG_Collection
export async function readLAG(client: MongoClient, lag_number: number): Promise<LAG> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const lag: any = await lag_collection.findOne({ number: lag_number });
  return lag;
}

// Update a given document (by LAG Number) in LAG_Collection
export async function updateLAG(client: MongoClient, lag_number: number, new_lag: LAG) : Promise<any> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const response_update: any = await lag_collection.updateOne({ number: lag_number }, { $set: new_lag });
  if (response_update.modifiedCount == 0) {
    const response_create: any = await lag_collection.insertOne(new_lag);
    return response_create;
  } else return response_update;
}

// Delete a given document (by LAG Number) in LAG_Collection
export async function deleteLAG(client: MongoClient, lag_number: number) : Promise<any> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const response: any = await lag_collection.deleteOne({ number: lag_number });
  return response;
}

// Read all documents in LAG_Collection
export async function readLAGCollection(client: MongoClient): Promise<LAG[]> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const documents: Document[] = await lag_collection.find().toArray();

  const lags: LAG[] = [];
  for (const document of documents) {
    const lag_obj = {
      heading: document.heading, 
      subheading: document.subheading, 
      number: document.number,
      date: document.date,
      special_insights: document.special_insights,
      content: document.content,
    };
    lags.push(lag_obj);
  }

  return lags;
}

// Delete all documents in LAG_Collection
export async function deleteLAGCollection(client: MongoClient): Promise<any> {
  const lags: LAG[] = await readLAGCollection(client);

  for (const lag of lags) {
    await deleteLAG(client, lag.number);
  }
}

