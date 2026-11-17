type Props = {
  children: string;
  /** Section labels sit on cream as often as on ink. */
  tone?: "light" | "dark";
};

export default function SectionLabel({ children, tone = "dark" }: Props) {
  return (
    <p
      className={`m-0 font-mono text-[10.5px] uppercase leading-none tracking-[0.2em] ${
        tone === "dark" ? "text-white/40" : "text-ink/45"
      }`}
    >
      {children}
    </p>
  );
}
