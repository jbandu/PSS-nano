/**
 * Mock for Next.js Navigation (App Router)
 */

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
});

export const usePathname = () => '/';

export const useSearchParams = () => ({
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  keys: jest.fn(),
  values: jest.fn(),
  entries: jest.fn(),
  forEach: jest.fn(),
  toString: jest.fn(() => ''),
});

export const useParams = () => ({});

export const redirect = jest.fn();

export const notFound = jest.fn();
