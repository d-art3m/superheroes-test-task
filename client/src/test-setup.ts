import '@testing-library/jest-dom';

process.on('unhandledRejection', reason => {
  console.error('UnhandledRejection in test:', reason);
  throw reason instanceof Error ? reason : new Error(String(reason));
});
