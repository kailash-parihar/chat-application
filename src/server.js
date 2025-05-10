// backend/src/server.js

import express from "express";
import cookieParser from "cookie-parser";
import establishDBConnection from "./database/db.connection.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const server = express();

server.use(express.json());
server.use(cookieParser());

server.use("/api/auth", authRoutes);
server.use("/api/message", messageRoutes);

const startServer = async () => {
  try {
    // Establish a connection to the database
    const isDBConnected = await establishDBConnection();
    if (isDBConnected) {
      console.log(`MongoDB Connection Established Successfully`);

      const port = process.env.PORT || 3001;

      // Start the server and listen on the specified port
      server.listen(port, () => {
        console.info(`\nServer is start running on http://127.0.0.1:${port}\n`);
      });
    } else {
      console.error("\nDatabase connection failed. Aborting server startup");
      process.exit(1); // Exit the process if the database connection fails
    }
  } catch (err) {
    console.error("\nServer Startup Failure\n", err);
    process.exit(1); // Exit the process with an error code
  }
};
export default startServer;
