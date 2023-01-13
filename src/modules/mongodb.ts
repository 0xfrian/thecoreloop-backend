// Official MongoDB Docs: https://www.mongodb.com/docs/drivers/node/current/

// Types
import { LAG } from "../types";
import { MongoClient, Collection, Document } from "mongodb";

export async function createMongoDBClient(uri: string): Promise<MongoClient> {
  try {
    const client: MongoClient = new MongoClient(uri);
    await client.connect();
    return client;
  } catch (error) {
    throw error;
  }
}

export async function getLatestLAG(client: MongoClient): Promise<number> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const response: any = await lag_collection.findOne({ heading: "Latest LAG"});
  return response.number;
}

export async function setLatestLAG(client: MongoClient, lag_number: number): Promise<any> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

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

export async function createLAG(client: MongoClient, lag: LAG): Promise<void> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const response: any = await lag_collection.insertOne(lag)
  return response;
}

export async function readLAG(client: MongoClient, lag_number: number): Promise<LAG> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const lag: any = await lag_collection.findOne({ number: lag_number });
  return lag;
}

export async function updateLAG(client: MongoClient, lag_number: number, new_lag: LAG) : Promise<void> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const lag: any = await lag_collection.updateOne({ number: lag_number }, { $set: new_lag });
  return lag;
}

export async function deleteLAG(client: MongoClient, lag_number: number) : Promise<void> {
  const lag_collection: Collection = client 
    .db("LAG_Database")
    .collection("LAG_Collection");

  const response: any = await lag_collection.deleteOne({ number: lag_number });
  return response;
}

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
      message_id: document.message_id,
      number: document.number,
      date: document.date,
      content: document.content,
    };
    lags.push(lag_obj);
  }

  return lags;
}

export async function deleteLAGCollection(client: MongoClient): Promise<void> {
  const lags: LAG[] = await readLAGCollection(client);

  for (const lag of lags) {
    await deleteLAG(client, lag.number);
  }
}

