import Koa from 'koa';
import Router, { RouterContext } from 'koa-router';
import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import { Bot } from './bot';

const app = new Koa();
const router = new Router();

const adaptor = new BotFrameworkAdapter({
  appId: process.env.BOT_APP_CLIENT_ID,
  appPassword: process.env.BOT_APP_CLIENT_PASSWORD
});

const bot = new Bot();

const createExpressLikeResponse = (ctx: RouterContext<{}, {}>) => ({
  status(code: number): void {
    ctx.status = code;
  },
  send(body: string): void {
    ctx.body = body;
  },
  end(): void {
  }
});

router.post('/api/messages', async (ctx: RouterContext<{}, {}>) => {
  const { request: req } = ctx;
  const res = createExpressLikeResponse(ctx);

  await adaptor.processActivity(req, res, async (turnContext: TurnContext): Promise<void> => {
    await bot.run(turnContext);
  });
});

app.use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);
