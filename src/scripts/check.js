import { QaCop } from '#blocks/utilities/qaCop';
import { Logger } from '#blocks/utilities/logger';

export const check = async () => {
  Logger.log('QA check is starting up...\n');

  QaCop.check(process.argv.slice(2));
};

check();
