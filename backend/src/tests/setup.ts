process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/food-order-app-test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret-for-backend-tests';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';
process.env.STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY ?? '';
process.env.STRIPE_WEBHOOK_SECRET = '';
