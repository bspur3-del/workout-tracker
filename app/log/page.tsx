import { getUsers } from '@/lib/db';
import LogForm from '@/components/LogForm';

export const revalidate = 300;

export default async function LogPage() {
  const users = await getUsers();
  return <LogForm users={users} />;
}
