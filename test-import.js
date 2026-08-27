// Test if we can import the adapter
try {
  // Simulate what Next.js might do
  const adapter = require('@auth/prisma-adapter');
  console.log('Adapter loaded:', typeof adapter, adapter);
  console.log('PrismaAdapter:', typeof adapter.PrismaAdapter);
  
  if (adapter.PrismaAdapter) {
    const result = adapter.PrismaAdapter({
      user: { findUnique: () => null, create: () => null },
    });
    console.log('Adapter result:', typeof result);
    console.log('Adapter result keys:', Object.keys(result));
  }
} catch (e) {
  console.error('Error:', e.message);
}