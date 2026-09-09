/* oxlint-disable next/no-img-element -- Local decorative illustrations on a static site. */

export function Doodle({
  kind,
  className = '',
}: {
  kind: 'builder' | 'reader' | 'explainer';
  className?: string;
}) {
  return (
    <img
      className={`portfolio-doodle ${className}`}
      src={`/illustrations/${kind}.png`}
      width={1024}
      height={1024}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}
