import { TeamsActivityHandler, TurnContext, MessageFactory, ChannelAccount } from 'botbuilder';

export class Bot extends TeamsActivityHandler {
  constructor() {
    super();
    this.onConversationUpdate((context: TurnContext, next: () => Promise<void>) => this._handleConversationUpdate(context, next));
    this.onMembersAdded((context: TurnContext, next: () => Promise<void>) => this._handleMembersAdded(context, next));
  }

  async _handleConversationUpdate(_context: TurnContext, next: () => Promise<void>): Promise<void> {
    await next();
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
    const message = MessageFactory.text(`Welcome ${member.name}`);
    await context.sendActivity(message);
  }
}
