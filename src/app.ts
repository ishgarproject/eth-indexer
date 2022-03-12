import { listeners } from '~/modules/listeners';

const start = () => {
  try {
    listeners();
  } catch (err) {
    process.exit(1);
  }
};

start();
