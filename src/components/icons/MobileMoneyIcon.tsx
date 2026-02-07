import { SVGProps } from 'react';

export function MobileMoneyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Phone body */}
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      {/* Screen */}
      <rect x="7" y="4" width="10" height="12" rx="1" fill="none" />
      {/* Money/Currency symbol inside screen */}
      <circle cx="12" cy="10" r="3" strokeWidth="1.5" />
      <path d="M12 7.5v5" strokeWidth="1.5" />
      <path d="M10.5 8.5h3" strokeWidth="1.5" />
      <path d="M10.5 11.5h3" strokeWidth="1.5" />
      {/* Home button */}
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}