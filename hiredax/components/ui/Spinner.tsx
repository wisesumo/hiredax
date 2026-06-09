const sizeMap = { sm: 16, md: 24, lg: 36 } as const;

interface SpinnerProps {
  size?: keyof typeof sizeMap;
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        flexShrink: 0,
        width: px,
        height: px,
        borderRadius: "var(--radius-full)",
        border: "2px solid var(--color-navy-12)",
        borderTopColor: "var(--color-navy)",
        animation: "hd-spin 0.7s linear infinite",
      }}
    />
  );
}
