import { listeners } from '~/modules/listeners';

const start = async () => {
  try {
    await listeners();
  } catch (err) {
    process.exit(1);
  }
};

start();
