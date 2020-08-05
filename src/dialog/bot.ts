import {
  TeamsActivityHandler,
  TurnContext,
  MessageFactory,
  ChannelAccount,
  ConversationState,
  StatePropertyAccessor,
} from 'botbuilder';
import {
  DialogState
} from 'botbuilder-dialogs';

import { ProfileDialog } from './profile-dialog';



export class Bot extends TeamsActivityHandler {
  private dialog: ProfileDialog;
  private dialogState: StatePropertyAccessor<DialogState>;
  private conversationState: ConversationState;

  constructor(conversationState: ConversationState, dialog: ProfileDialog) {
    super();
    this.conversationState = conversationState;
    this.dialog = dialog;
    this.dialogState = this.conversationState.createProperty('dialog');
    this.onMembersAdded((context: TurnContext, next: () => Promise<void>) => this._handleMembersAdded(context, next));
    this.onMessage((context: TurnContext, next: () => Promise<void>) => this._handleMessage(context, next));
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

    await this.dialog.run(context, this.dialogState);
  }

  async _handleMessage(context: TurnContext, next: () => Promise<void>): Promise<void> {
    await this.dialog.run(context, this.dialogState);
    await next();
  }

  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context);
  }
}
