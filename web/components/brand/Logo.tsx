import Image from 'next/image';

interface LogoProps {
  variant?: 'dark' | 'light';
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ variant = 'dark', className, width = 140, height = 32 }: LogoProps) {
  const src = variant === 'light' ? '/brand/harmoney-logo-light.svg' : '/brand/harmoney-logo.svg';
  return (
    <Image
      src={src}
      alt="Harmoney"
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}
