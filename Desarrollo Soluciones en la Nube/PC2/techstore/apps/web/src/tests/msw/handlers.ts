import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3001';

const adminUser = {
  id: 'u-admin',
  email: 'admin@techstore.com',
  fullName: 'Ana Admin',
  storeId: null,
  mfaEnabled: false,
  roles: ['ADMIN'],
};

export const handlers = [
  http.post(`${BASE}/auth/login`, async () => {
    return HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: {
        tokens: { accessToken: 'fake-access', expiresIn: 900 },
        user: adminUser,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${BASE}/auth/refresh`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: { accessToken: 'fake-refreshed', expiresIn: 900 },
      timestamp: new Date().toISOString(),
    }),
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      statusCode: 200,
      message: 'OK',
      data: adminUser,
      timestamp: new Date().toISOString(),
    }),
  ),
];
