// backend/database/db.connection.js

import mongoose from "mongoose";

const establishDBConnection = async () => {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\nEstablishing MongoDB Connection
      Host : ${dbConnection.connection.host}  `);
    return true;
  } catch (error) {
    console.error(`\nMongoDB Connection Error:
      Error Name : ${error.name}
      Error Message : ${error.message}`);
  }
  return false;
};
export default establishDBConnection;
