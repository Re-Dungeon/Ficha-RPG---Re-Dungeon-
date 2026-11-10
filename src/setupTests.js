import '@testing-library/jest-dom/vitest';

vi.mock('service/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));
