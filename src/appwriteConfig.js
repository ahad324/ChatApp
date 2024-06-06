import { Client, Databases, Account } from "appwrite";

export const PROJECT_ID = "66560c280031ad705fdc";
export const DATABASE_ID = "66560d1e0021f61e60e3";
export const COLLECTION_ID_MESSAGE = "66560d3100244736956c";
export const COLLECTION_ID_LIKES = "6660ee33002e9a69b573";
export const COLLECTION_ID_USER_LIKES = "66620858000c33bdcca0";

const client = new Client();

client
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('66560c280031ad705fdc');

export const databases = new Databases(client);
export const account = new Account(client);
export default client;