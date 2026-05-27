import { useEffect } from 'react';
import AmrutGalleryPage from '../../../Components/Daily-Quotes/AmrutGalleryPage';

export default function AmrutNuAachamanPage() {
  useEffect(() => {
    document.title = 'Amrut Nu Aachaman | Swaminarayan Gurukul';
  }, []);

  return <AmrutGalleryPage />;
}