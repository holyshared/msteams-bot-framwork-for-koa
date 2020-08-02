import { TeamsActivityHandler, TurnContext, MessageFactory, ChannelAccount, ConversationState, StatePropertyAccessor } from 'botbuilder';
import { BotState } from './state';

export class Bot extends TeamsActivityHandler {
  private state: BotState;

  constructor(botState: BotState) {
    super();
    this.state = botState;
    this.onMembersAdded((context: TurnContext, next: () => Promise<void>) => this._handleMembersAdded(context, next));
  }

  async _handleMembersAdded(context: TurnContext, next: () => Promise<void>): Promise<void> {
    const membersAdded = context.activity.membersAdded;
    const addedMemners = membersAdded.filter((addedMember: ChannelAccount) => addedMember.id !== context.activity.recipient.id);
    const welcomeMessages = addedMemners.map(
      async (addedMemner: ChannelAccount) => this.sendWelcomeMessage(addedMemner, context)
    );
    await Promise.all(welcomeMessages);
    await next();
  }

  async sendWelcomeMessage(member: ChannelAccount, context: TurnContext): Promise<void> {
    const conversation = await this.state.getConversationReferenceByMember(member, context);
    const message = MessageFactory.text(`Welcome ${conversation.userName}`);
    await context.sendActivity(message);
  }

  async run(context: TurnContext): Promise<void> {
    await super.run(context);
    await this.state.saveChanges(context);
  }
}
