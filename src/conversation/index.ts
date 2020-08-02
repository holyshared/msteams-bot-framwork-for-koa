import { Bot } from './bot';
import { BotState } from './state';
import { Db } from 'mongodb';

export type ConversationBot = Bot;

export function createBot(db: Db): Bot {
  return new Bot(new BotState(db));
}