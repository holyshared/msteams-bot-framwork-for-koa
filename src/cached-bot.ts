import Koa from 'koa';
import Router, { RouterContext } from 'koa-router';
import { BotFrameworkAdapter, TurnContext, WebResponse } from 'botbuilder';
import { createBot, ConversationBot } from './conversation';
import { MongoClient, Db } from 'mongodb';

const router = new Router();

const adaptor = new BotFrameworkAdapter({
  appId: process.env.BOT_APP_CLIENT_ID,
  appPassword: process.env.BOT_APP_CLIENT_PASSWORD
});

const createWebResponse = (ctx: RouterContext<{}, {}>): WebResponse => ({
  status(code: number): void {
    ctx.status = code;
  },
  send(body: string): void {
    ctx.body = body;
  },
  end(): void {
  }
});

router.post('/api/messages', async (ctx: RouterContext<{}, { db: Db, bot: ConversationBot }>) => {
  const res = createWebResponse(ctx);

  await adaptor.processActivity(ctx.req, res, async (turnContext: TurnContext): Promise<void> => {
    await ctx.bot.run(turnContext);
  });
});

const connectMongodb = async () => {
  const client = await MongoClient.connect('mongodb://bot:bot@127.0.0.1:27017/bot', {
    useNewUrlParser: true
  });
  return client.db('bot');
}

connectMongodb().then(db => {
  const app = new Koa();

  app.context.db = db;
  app.context.bot = createBot(db);

  app.use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
}).catch(err => {
  console.log(err);
});
