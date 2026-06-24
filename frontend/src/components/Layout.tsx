import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function Layout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {children}
    </div>
  );
}
