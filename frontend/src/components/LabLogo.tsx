import { useState } from 'react';

interface LabLogoProps {
  name: string;
  logoUrl: string | null;
  size?: 'sm' | 'md';
}

const sizes = { sm: 'size-6 text-xs', md: 'size-10 text-base' };

// Decorative: the lab name is always written next to it.
export default function LabLogo({ name, logoUrl, size = 'md' }: LabLogoProps) {
  const [failed, setFailed] = useState(false);

  if (logoUrl && !failed) {
    return (
      <img
        src={logoUrl}
        alt=""
        onError={() => setFailed(true)}
        className={`${sizes[size]} shrink-0 rounded-md object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      data-testid="lab-initial"
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-md bg-indigo-100 font-semibold text-indigo-700`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
