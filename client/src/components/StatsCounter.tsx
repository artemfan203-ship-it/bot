import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface StatsCounterProps {
  value: number;
  label: string;
}

export function StatsCounter({ value, label }: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  const springValue = useSpring(0, {
    bounce: 0,
    duration: 2000,
  });
  
  const roundedValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    return roundedValue.on("change", (v) => {
      setDisplayValue(v);
    });
  }, [roundedValue]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-3 text-primary mb-2">
        <Users className="w-5 h-5" />
        <span className="text-sm font-semibold uppercase tracking-wider text-primary/80">
          Active Listeners
        </span>
      </div>
      <div className="text-4xl md:text-5xl font-bold font-display tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
        {displayValue.toLocaleString()}
      </div>
      <p className="text-sm text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
