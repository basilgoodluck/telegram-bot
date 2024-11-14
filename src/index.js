import http from "http"
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { configDotenv } from "dotenv";

configDotenv()

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => {
  ctx.reply("You started Noble bot\n Here are the commands available for now:\n - /start\n - /help")
})

bot.use((ctx, next) => {
    if (ctx.update.message && ctx.update.message.new_chat_members) {
      ctx.update.message.new_chat_members.forEach((newMember) => {
        const welcomeMessage = `Welcome, [${newMember.first_name}](tg://user?id=${newMember.id})\\!`;
        ctx.replyWithMarkdownV2(welcomeMessage);
      });
    }
    return next();
});

bot.launch()