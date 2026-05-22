import type { Metadata } from 'next';
import AmrutGalleryPage from '../../../Components/Daily-Quotes/AmrutGalleryPage';

export const metadata: Metadata = {
  title: 'Amrut Nu Aachaman | Swaminarayan Gurukul',
  description: 'Daily spiritual wisdom — Amrut Nu Aachaman gallery from Swaminarayan Gurukul.',
};

export default function AmrutNuAachamanPage() {
  return <AmrutGalleryPage />;
}
