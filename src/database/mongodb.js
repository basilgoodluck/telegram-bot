import { MongoClient } from "mongodb";
import { config as configDotenv } from "dotenv";

configDotenv();

const uri = process.env.MONGODB_URL || `mongodb+srv://nobledev:${encodeURIComponent(process.env.MONGODB_PSW)}@free-cluster.xucjn.mongodb.net/?retryWrites=true&w=majority&appName=free-cluster`;

const client = new MongoClient(uri)
let db;

async function connect() {
    if(!db){
        await client.connect()
        db = client.db("noble-bot")

    }
    
    return db    
}

export {connect}