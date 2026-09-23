export default function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-1" role="separator">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-terracotta-300/50 to-transparent" />
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <path
          d="M2 12L9 2l7 10"
          stroke="#c17a5c"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>
      {label ? (
        <span className="font-script text-terracotta-600 text-lg leading-none">{label}</span>
      ) : null}
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-terracotta-300/50 to-transparent" />
    </div>
  );
}
