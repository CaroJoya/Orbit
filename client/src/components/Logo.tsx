// client/src/components/Logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "small" | "tiny";
  inverse?: boolean;
  onClick?: () => void;
}

export function Logo({
  className,
  variant = "default",
  inverse = false,
  onClick,
}: LogoProps) {
  const sizeClasses = {
    default: "h-12 w-auto",
    small: "h-9 w-auto",
    tiny: "h-5 w-auto",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center cursor-pointer select-none bg-transparent border-0 p-0",
        className
      )}
      aria-label="Go to home"
    >
      <svg
        viewBox="0 0 240 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[variant]}
        aria-label="Orbit logo"
      >
        {/* Planet body */}
        <circle cx="60" cy="60" r="42" fill={inverse ? "#FFFFFF" : "#172223"} />
        {/* Ring - back part */}
        <path
          d="M14 62 C14 78, 40 88, 60 88 C80 88, 106 78, 106 62"
          stroke={inverse ? "#FFFFFF" : "#172223"}
          strokeWidth="8"
          fill="none"
          opacity="0.85"
        />
        {/* Ring - front part */}
        <path
          d="M14 58 C14 42, 40 32, 60 32 C80 32, 106 42, 106 58"
          stroke={inverse ? "#FFFFFF" : "#172223"}
          strokeWidth="8"
          fill="none"
        />
        {/* "Orbit" text */}
        <text
          x="115"
          y="80"
          fontFamily="Fraunces, Georgia, serif"
          fontSize="60"
          fontWeight="600"
          fill={inverse ? "#FFFFFF" : "#172223"}
          letterSpacing="-2"
        >
          rbit
        </text>
      </svg>
    </button>
  );
}

export default Logo;