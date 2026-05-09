import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck, ShieldEllipsis } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

const LEVELS = [
  { label: 'Vulnerable', color: 'bg-red-500', text: 'text-red-500', icon: ShieldAlert },
  { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-500', icon: ShieldAlert },
  { label: 'Moderate', color: 'bg-yellow-500', text: 'text-yellow-500', icon: ShieldEllipsis },
  { label: 'Secure', color: 'bg-emerald-500', text: 'text-emerald-500', icon: ShieldCheck },
  { label: 'Immutable', color: 'bg-primary', text: 'text-primary', icon: Shield },
];

const evaluateStrength = (pass: string) => {
  if (!pass) {
    return {
      score: 0,
      ...LEVELS[0],
      label: 'Missing',
    };
  }

  let score = 0;

  if (pass.length >= 8) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^a-zA-Z\d]/.test(pass)) score++;
  if (pass.length >= 16) score++;

  const finalScore = Math.min(score, 4);

  return {
    score: finalScore,
    ...LEVELS[finalScore],
  };
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const strength = useMemo(() => evaluateStrength(password), [password]);

  if (!password) return null;

  const Icon = strength.icon;

  const entropy = Math.min(
    strength.score * 25 + (password.length > 0 ? 10 : 0),
    100
  );

  const isMax = strength.score === 4;

  return (
    <div className="mt-3 space-y-2">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            size={13}
            className={cn(
              strength.text,
              isMax && "animate-pulse drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            )}
          />

          <span
            className={cn(
              "text-[10px] font-extrabold uppercase tracking-widest transition-all",
              strength.text,
              isMax && "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            )}
          >
            {strength.label}
          </span>
        </div>

        <span
          className={cn(
            "text-[10px] font-mono transition-all",
            isMax ? "text-cyan-400 font-bold" : "text-muted-foreground"
          )}
        >
          {entropy}% entropy
        </span>
      </div>

      {/* METER */}
      <div className="flex gap-1 h-1.5 w-full">
        {[0, 1, 2, 3].map((i) => {
          const active = i < strength.score;

          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0.8, opacity: 0.3 }}
              animate={{
                scaleX: 1,
                opacity: active ? 1 : 0.2,
              }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex-1 rounded-full transition-all duration-500",
                active ? strength.color : "bg-muted/20",
                isMax &&
                  active &&
                  "shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse"
              )}
            />
          );
        })}
      </div>

      {/* MESSAGE */}
      {password.length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[9px] text-muted-foreground italic leading-snug"
        >
          {isMax ? (
            <span className="text-cyan-400 font-bold">
              ⚡ Quantum-grade entropy achieved. System locked at maximum strength.
            </span>
          ) : strength.score <= 1 ? (
            "Use uppercase, numbers, and symbols."
          ) : strength.score === 2 ? (
            "Increase length to 12+ characters."
          ) : (
            "Strong encryption-ready password."
          )}
        </motion.p>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;