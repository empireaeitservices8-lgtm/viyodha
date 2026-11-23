import React from "react";

export function parseBilingualName(name?: string | null): { english: string; malayalam: string } {
  if (!name || typeof name !== "string") return { english: "", malayalam: "" };

  // 1. Match "English (Malayalam)" e.g. "Green Cardamom (ഏലക്ക)"
  const parenMatch = name.match(/^(.*?)\s*\(([\u0D00-\u0D7F\s.,-]+)\)\s*$/);
  if (parenMatch) {
    return { english: parenMatch[1].trim(), malayalam: parenMatch[2].trim() };
  }

  // 2. Match without parens if Malayalam characters are at the end, e.g. "Green Cardamom ഏലക്ക"
  const spaceMatch = name.match(/^(.*?)\s+([\u0D00-\u0D7F\s.,-]+)$/);
  if (spaceMatch && !/[\u0D00-\u0D7F]/.test(spaceMatch[1])) {
    return { english: spaceMatch[1].trim(), malayalam: spaceMatch[2].trim() };
  }

  return { english: name, malayalam: "" };
}

interface BilingualNameProps {
  name?: string | null;
  className?: string;
  malayalamClassName?: string;
  asBlock?: boolean;
}

export function BilingualName({
  name,
  className,
  malayalamClassName = "text-[0.68em] font-normal normal-case tracking-normal opacity-80 ml-1.5",
  asBlock = false,
}: BilingualNameProps) {
  if (!name) return null;
  const { english, malayalam } = parseBilingualName(name);

  if (!malayalam) {
    return <span className={className}>{name}</span>;
  }

  if (asBlock) {
    return (
      <span className={className}>
        <span className="block">{english}</span>
        <span className={`block ${malayalamClassName}`}>({malayalam})</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <span>{english}</span>
      <span className={`inline-block ${malayalamClassName}`}>({malayalam})</span>
    </span>
  );
}

export default BilingualName;
