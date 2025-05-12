'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();

  const hiddenPaths = ['/admin'];
  const shouldHide = hiddenPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (shouldHide) return null;

  return <Navbar />;
}
