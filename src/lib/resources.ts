import 'server-only';
import { getDb } from '@/lib/db';

export type Resource = {
  id: string;
  name: string;
  description: string;
  location: string;
  is_active: boolean;
};

export async function listResources(): Promise<Resource[]> {
  const result = await getDb().query<Resource>(
    'SELECT id, name, description, location, is_active FROM resources ORDER BY is_active DESC, name, id',
  );
  return result.rows;
}
