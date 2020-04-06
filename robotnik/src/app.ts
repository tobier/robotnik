import * as config from '../config.json';
import { Builder} from './bot';

const bot = new Builder().build();
bot.login(config.token);
