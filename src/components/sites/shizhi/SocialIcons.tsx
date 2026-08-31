export function BilibiliIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m8 3 2.2 2.6M16 3l-2.2 2.6M5.5 7.2h13A2.5 2.5 0 0 1 21 9.7v8.1a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.8V9.7a2.5 2.5 0 0 1 2.5-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M8.2 12.2v2.6M15.8 12.2v2.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function RedNoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M7 9.2h10M8.2 14.8l2.4-3.5 2.4 3.5 2.8-4.2" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.93c.46.08.63-.2.63-.44v-1.62c-2.56.56-3.1-1.09-3.1-1.09-.42-1.06-1.02-1.34-1.02-1.34-.84-.57.06-.56.06-.56.93.06 1.42.95 1.42.95.82 1.41 2.16 1 2.69.77.08-.6.32-1 .59-1.23-2.04-.23-4.19-1.02-4.19-4.55 0-1 .36-1.83.95-2.47-.1-.23-.41-1.17.09-2.44 0 0 .78-.25 2.53.94A8.8 8.8 0 0 1 12 7.34a8.7 8.7 0 0 1 2.3.31c1.76-1.19 2.53-.94 2.53-.94.5 1.27.19 2.21.09 2.44.59.64.95 1.46.95 2.47 0 3.54-2.15 4.31-4.2 4.54.33.29.62.85.62 1.72v2.41c0 .24.17.53.63.44A9.2 9.2 0 0 0 12 2.8Z" fill="currentColor"/>
    </svg>
  );
}

export const socialLinks = [
  { name: "GitHub", Icon: GithubIcon, href: "https://github.com/Winddfall/Glean" },
  { name: "哔哩哔哩", Icon: BilibiliIcon, href: "#" },
  { name: "小红书", Icon: RedNoteIcon, href: "#" },
] as const;
