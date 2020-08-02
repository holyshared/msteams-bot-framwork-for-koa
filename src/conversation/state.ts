import { TurnContext, ChannelAccount, ConversationState, StatePropertyAccessor, StoreItems } from 'botbuilder';
import { MongoDBStorage } from './storage';
import { Db } from 'mongodb';

export interface CachedConversation extends StoreItems {
  id: string;
  botId: string;
  channelId: string;
  userId: string;
  userName: string;
  serviceUrl: string;
}

interface ConversationDocument { conversation: CachedConversation };

export class BotState {
  private conversation: ConversationState;
  private conversationProperty: StatePropertyAccessor<CachedConversation>;

  constructor(
    db: Db
  ) {
    this.conversation = new ConversationState(new MongoDBStorage<ConversationDocument>(db, 'conversations'));
    this.conversationProperty = this.conversation.createProperty<CachedConversation>('conversation');
  }

  async getConversationReferenceByMember(member: ChannelAccount, context: TurnContext): Promise<CachedConversation> {
    const ref = TurnContext.getConversationReference(context.activity);
    ref.user = member;
    const conversation = await this.conversationProperty.get(context, {
      id: ref.conversation.id,
      botId: ref.bot.id,
      channelId: ref.channelId,
      userId: ref.user.id,
      userName: ref.user.name,
      serviceUrl: ref.serviceUrl
    });
    return conversation;
  }
  async saveChanges(context: TurnContext): Promise<void> {
    await this.conversation.saveChanges(context);
  }
}
