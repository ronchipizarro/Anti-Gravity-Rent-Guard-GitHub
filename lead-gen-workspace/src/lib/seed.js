// This was a seed script, usually used in API routes but exported as a helper too
import { getDb } from './db';

export async function seedDatabase() {
  const db = getDb();
  // ... seed logic (already implemented in api/seed/route.js)
}
