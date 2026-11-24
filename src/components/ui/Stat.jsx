import GlowCard from "@/components/ui/GlowCard";
import CountUp from "@/components/ui/CountUp";
import Icon from "@/components/ui/Icon";

const TONES = {
  teal: "from-tone-teal to-tone-sky",
  sky: "from-tone-sky to-tone-cyan",
  cyan: "from-tone-cyan to-tone-mint",
  orange: "from-tone-orange to-tone-amber",
  gray: "from-tone-gray to-white",
  red: "from-tone-red to-tone-amber",
  yellow: "from-tone-yellow to-tone-amber",
  green: "from-tone-green to-tone-teal",
};

export default function Stat({ label, value, icon, tone = "teal", href, active = false, prefix, index = 0 }) {
  return (
    <GlowCard href={href} style={{ "--i": index }} className={`tile rise flex items-center gap-3 p-4 ${active ? "ring-2 ring-brand" : ""}`}>
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br text-ink ${TONES[tone]}`}>
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink-soft">{label}</span>
        <span className="block truncate text-2xl font-bold tabular-nums">
          <CountUp value={value} prefix={prefix} />
        </span>
      </span>
    </GlowCard>
  );
}
