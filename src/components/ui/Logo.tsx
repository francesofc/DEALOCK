"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 36 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring - represents "deal/transaction" boundary */}
      <circle
        cx="18"
        cy="18"
        r="16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.9"
      />
      
      {/* Inner "D" shape - stylized for Dealock */}
      <path
        d="M12 10C12 9.44772 12.4477 9 13 9H18C21.3137 9 24 11.6863 24 15V21C24 24.3137 21.3137 27 18 27H13C12.4477 27 12 26.5523 12 26V10Z"
        fill="currentColor"
      />
      
      {/* Inner cutout to complete the "D" letterform */}
      <path
        d="M15 13C14.4477 13 14 13.4477 14 14V22C14 22.5523 14.4477 23 15 23H18C19.6569 23 21 21.6569 21 20V16C21 14.3431 19.6569 13 18 13H15Z"
        fill="var(--background, #0d0d0f)"
      />
      
      {/* Small accent dot - represents "lock" point */}
      <circle
        cx="25"
        cy="18"
        r="2.5"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

export function LogoSmall({ className = "", size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="18"
        cy="18"
        r="16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M12 10C12 9.44772 12.4477 9 13 9H18C21.3137 9 24 11.6863 24 15V21C24 24.3137 21.3137 27 18 27H13C12.4477 27 12 26.5523 12 26V10Z"
        fill="currentColor"
      />
      <path
        d="M15 13C14.4477 13 14 13.4477 14 14V22C14 22.5523 14.4477 23 15 23H18C19.6569 23 21 21.6569 21 20V16C21 14.3431 19.6569 13 18 13H15Z"
        fill="var(--background, #0d0d0f)"
      />
      <circle
        cx="25"
        cy="18"
        r="2.5"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}
