import { Link } from 'react-router-dom';

export default function DailyDarshanPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Daily Darshan</h1>
      <p className="mb-6 text-gray-700">The Daily Darshan content has been consolidated into the main Overview page.</p>
      <Link to="/" className="rounded-lg bg-red-500 px-4 py-2 text-white">Go to Overview</Link>
    </div>
  );
}
