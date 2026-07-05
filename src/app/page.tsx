import { redirect } from 'next/navigation';

export default function RootPage() {
  // If they hit the root, send them to the dashboard. 
  // (The middleware will protect it if they aren't logged in!)
  redirect('/dashboard');
}