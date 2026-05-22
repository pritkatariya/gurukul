import type { Metadata } from 'next';
import DailyDarshan from '../../../Components/Daily-Quotes/Daily-Darshan';

export const metadata: Metadata = {
  title: 'Daily Darshan | Swaminarayan Gurukul',
  description: 'Experience divine presence every day — Daily Darshan gallery from Swaminarayan Gurukul.',
};

export default function DailyDarshanPage() {
  return <DailyDarshan />;
}
