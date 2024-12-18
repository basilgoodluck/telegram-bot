import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Telegraf } from 'telegraf';
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

server.listen(PORT, () => {
    console.log(`Server is running at http://${hostname}:${PORT}`);
});

const shutdown = () => {
    console.log("Shutting down gracefully...");
    bot.stop("SIGTERM");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lock_file = path.join(__dirname, "bot.lock");

const startBot = async () => {
    try {
        if (fs.existsSync(lock_file)) {
            console.log("Bot is already running! If not, delete bot.lock file.");
            process.exit(1);
        }

        fs.writeFileSync(lock_file, "locked");
        await bot.launch();
        console.log("Bot has started successfully");

        process.once("SIGINT", shutdown);
        process.once("SIGTERM", shutdown);
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
