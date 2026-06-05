type Props = {
  value: number; // 0-100
  label?: string;
  caption?: string;
};

export default function Gauge({ value, label = "Score", caption }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 88;
  const cx = 110;
  const cy = 110;
  const startAngle = 180;
  const endAngle = 0;

  const toXY = (angle: number, r = radius) => {
    const rad = (Math.PI / 180) * angle;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };

  const angleForValue = startAngle - (clamped / 100) * (startAngle - endAngle);
  const pointer = toXY(angleForValue, radius);

  const segments = [
    { from: 180, to: 144, color: "#E45A4A" },
    { from: 144, to: 108, color: "#F2A14A" },
    { from: 108, to: 72, color: "#F2D34A" },
    { from: 72, to: 36, color: "#C8E25F" },
    { from: 36, to: 0, color: "#5DBA6E" },
  ];

  const arcPath = (from: number, to: number, r = radius) => {
    const s = toXY(from, r);
    const e = toXY(to, r);
    const largeArc = Math.abs(from - to) > 180 ? 1 : 0;
    const sweep = from > to ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} ${sweep} ${e.x} ${e.y}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="w-full max-w-[260px]">
        {segments.map((seg, idx) => (
          <path
            key={idx}
            d={arcPath(seg.from, seg.to)}
            stroke={seg.color}
            strokeWidth={18}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        <circle cx={pointer.x} cy={pointer.y} r={9} fill="#0E0E0E" />
        <circle cx={pointer.x} cy={pointer.y} r={3.5} fill="#fff" />
      </svg>
      <div className="-mt-6 text-center">
        <div className="text-display text-4xl leading-none num">
          {Math.round(clamped)}
        </div>
        <div className="mt-1 text-xs font-medium text-ink-soft">{label}</div>
        {caption ? (
          <div className="text-[11px] text-ink-muted">{caption}</div>
        ) : null}
      </div>
    </div>
  );
}
