import {
  ComponentDialog,
  WaterfallDialog,
  DialogTurnResult,
  WaterfallStepContext,
  DialogTurnStatus,
  DialogSet,
  DialogState,
  TextPrompt,
} from "botbuilder-dialogs";
import { TurnContext, StatePropertyAccessor, MessageFactory } from "botbuilder";

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

interface ProfileDialogResult {
  name: string;
  email: string;
}

export class ProfileDialog extends ComponentDialog {
  constructor(dialogId?: string) {
    super(dialogId);

    this.addDialog(new TextPrompt('name'));
    this.addDialog(new TextPrompt('email'));
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.nameStep.bind(this),
      this.emailStep.bind(this),
      this.finishStep.bind(this),
    ]));

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async nameStep(step: WaterfallStepContext<{}>): Promise<DialogTurnResult> {
    return step.prompt('name', 'Please enter your name.');
  }

  async emailStep(step: WaterfallStepContext<{}>): Promise<DialogTurnResult> {
    const values = step.values as ProfileDialogResult;
    values.name = step.result;

    return step.prompt('email', 'Please enter your email.');
  }

  async finishStep(step: WaterfallStepContext<{}>): Promise<DialogTurnResult> {
    const values = step.values as ProfileDialogResult;
    values.email = step.result;

    const message = `name: ${values.name}, email: ${values.email}`;
    await step.context.sendActivity(MessageFactory.text(message));

    return step.endDialog();
  }

  async run(turnContext: TurnContext, accessor: StatePropertyAccessor<DialogState>) {
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);

    const dialogContext = await dialogSet.createContext(turnContext);
    const results = await dialogContext.continueDialog();

    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }
}
