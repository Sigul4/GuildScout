import { PresenceHandler } from './presence';
import { MemberHandler } from './member';
import { MessageHandler } from './message';
import { ReactionHandler } from './reaction';
import { StreamHandler} from './stream'

export { PresenceHandler } from './presence';
export { MemberHandler } from './member';
export { MessageHandler } from './message';
export { ReactionHandler } from './reaction';
export { StreamHandler } from './stream';


export const Handlers = {
  PresenceHandler,
  MemberHandler,
  MessageHandler,
  ReactionHandler,
  StreamHandler
} as const;
