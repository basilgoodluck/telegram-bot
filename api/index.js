import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Telegraf } from 'telegraf';
import { Scenes, session } from 'telegraf';
import { message } from 'telegraf/filters';
import { getWelcome } from './database/mongodb.js';
import { config as configDotenv } from "dotenv";

configDotenv();

const bot = new Telegraf(process.env.TOKEN);
const PORT = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || 'localhost';

const server = http.createServer((req, res) => {
    const { url, method } = req;

    console.log(`Incoming request: ${method} ${url}`);

    res.setHeader("Content-Type", "application/json");

    const path = url.split('?')[0];

    if (path === "/" && method === "GET") {
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Welcome to my telegram bot" }));
    } 
    else if (path === "/api/data" && method === "GET") {
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "This is the about page" }));
    } 
    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ message: "No route found" })); 
    }
});

server.listen(() => {
    console.log(`Server is running at http://${hostname}:${PORT}`);
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
const lock_file = path.join(__dirname, "bot.lock")


const startBot = async () => {
    try {
        if (fs.existsSync(lock_file)) {
            console.log("Bot is already running! If not, delete bot.lock file.");
            process.exit(1);
        }

        fs.writeFileSync(lock_file, "locked");
        await bot.launch();
        console.log("Bot has started successfully");

        process.once("SIGINT", () => {
            bot.stop("SIGINT");
            console.log("Bot stopped SIGINT");
        });

        process.once("SIGTERM", () => {
            bot.stop("SIGTERM");
            console.log("Bot stopped SIGTERM");
        });
    }
    catch (err) {
        console.error("Error starting bot: ", err);
        stopBot();
    }
};

const stopBot = async () => {
    if (fs.existsSync(lock_file)) {
        fs.unlinkSync(lock_file);
    }

    bot.stop("SIGTERM");
    console.log("Bot has been stopped");
    process.exit(1);
};

startBot();
