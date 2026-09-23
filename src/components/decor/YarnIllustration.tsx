export default function YarnIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="80" cy="88" r="46" fill="#f4dbd0" />
      <path
        d="M40 88a40 40 0 0 1 40-40"
        stroke="#8fa96f"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M80 128a40 40 0 0 0 34-59"
        stroke="#c17a5c"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M52 66c8-3 17 2 20 11 3 9-2 19-11 22-9 3-19-2-22-11"
        stroke="#a8624a"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
      <g stroke="#faf3ea" strokeWidth="5.5" strokeLinecap="round">
        <line x1="34" y1="20" x2="96" y2="82" />
        <line x1="126" y1="20" x2="64" y2="82" />
      </g>
      <g stroke="#e9d3b3" strokeWidth="1.5" strokeLinecap="round">
        <line x1="34" y1="20" x2="96" y2="82" />
        <line x1="126" y1="20" x2="64" y2="82" />
      </g>
      <circle cx="34" cy="18" r="3" fill="#a8624a" />
      <circle cx="126" cy="18" r="3" fill="#a8624a" />
    </svg>
  );
}
