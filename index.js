import dotenv from "dotenv";
dotenv.config();
console.info("\nEnvironment Variables Loaded");


import startServer from "./src/server.js";
startServer();
