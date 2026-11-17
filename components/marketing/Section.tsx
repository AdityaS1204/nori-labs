import SectionLabel from "./SectionLabel";

type Props = {
  id: string;
  index: string;
  label: string;
  children: React.ReactNode;
  className?: string;
};

export default function Section({ id, index, label, children, className = "" }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-label`}
      className={`scroll-mt-[var(--nav-h)] border-t border-white/[0.07] ${className}`}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10 px-5 py-16 sm:px-8 md:gap-14 md:py-24">
        <div id={`${id}-label`}>
          <SectionLabel index={index}>{label}</SectionLabel>
        </div>
        {children}
      </div>
    </section>
  );
}
