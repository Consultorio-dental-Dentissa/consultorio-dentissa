import { assertJwtSecret, parseTrustProxyHops } from './env-validation';

describe('assertJwtSecret', () => {
  it('rechaza si falta', () => {
    expect(() => assertJwtSecret({})).toThrow();
  });
  it('en desarrollo acepta cualquier valor', () => {
    expect(() => assertJwtSecret({ JWT_SECRET: 'corto' })).not.toThrow();
  });
  it('en produccion rechaza el valor de ejemplo y secretos cortos', () => {
    const prod = { ON_PRODUCTION: 'true' };
    expect(() =>
      assertJwtSecret({ ...prod, JWT_SECRET: 'dentissa-dev-secret-cambiar' }),
    ).toThrow();
    expect(() =>
      assertJwtSecret({ ...prod, JWT_SECRET: 'a'.repeat(31) }),
    ).toThrow();
    expect(() =>
      assertJwtSecret({ ...prod, JWT_SECRET: 'a'.repeat(32) }),
    ).not.toThrow();
    expect(() =>
      assertJwtSecret({ NODE_ENV: 'production', JWT_SECRET: 'x' }),
    ).toThrow();
  });
});

describe('parseTrustProxyHops', () => {
  it('default 0 si no esta definido o vacio', () => {
    expect(parseTrustProxyHops({})).toBe(0);
    expect(parseTrustProxyHops({ TRUST_PROXY_HOPS: '' })).toBe(0);
  });
  it('acepta enteros y rechaza true u otros valores', () => {
    expect(parseTrustProxyHops({ TRUST_PROXY_HOPS: '2' })).toBe(2);
    expect(() => parseTrustProxyHops({ TRUST_PROXY_HOPS: 'true' })).toThrow();
    expect(() => parseTrustProxyHops({ TRUST_PROXY_HOPS: '-1' })).toThrow();
  });
});
