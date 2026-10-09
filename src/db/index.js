import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        //    console.log(conn);

        console.log(`Data base connected and hosted:${conn.connection.host}`);


    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1)

    }
}

export default connectDB;