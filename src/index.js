import http from "http";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config(); 

const bot = new Telegraf(process.env.TOKEN);  

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook-path') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString(); 
    });

    req.on('end', () => {
      try {
        const update = JSON.parse(body);  
        bot.handleUpdate(update);         
        res.writeHead(200);               
        res.end('OK');
      } catch (error) {
        console.error('Error handling update:', error);
        res.writeHead(400);              
        res.end('Invalid request');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;  
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.use((ctx, next) => {
  if (ctx.update.message && ctx.update.message.new_chat_members) {
    ctx.update.message.new_chat_members.forEach((newMember) => {
      const welcomeMessage = `Welcome, [${newMember.first_name}](tg://user?id=${newMember.id})\\!`;
      ctx.replyWithMarkdownV2(welcomeMessage);
    });
  }
  return next();
});

bot.launch({
  webhook: {
    domain: 'https://your-domain.com',  
    path: '/webhook-path', 
  },
});
