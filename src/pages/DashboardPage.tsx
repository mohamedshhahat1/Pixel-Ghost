import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Search,
  MessageSquare,
  EyeOff,
  LayoutDashboard,
  Monitor,
  Zap,
} from 'lucide-react';

import { useStegoStore } from '../store/useStegoStore';
import { cn } from '@/lib/utils';

export function DashboardPage({
  onPageChange,
}: {
  onPageChange: (page: string) => void;
}) {
  const recentLogs = useStegoStore((state) => state.recentLogs);

  return (
    <div className="space-y-6">

      {/* Hero */}
      <section className="relative py-6 flex items-center justify-center text-center">

        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[380px] h-[380px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-2xl">

          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7 }}
            className="
              relative
              text-center
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              tracking-tight
              leading-none
              text-foreground
              mb-4
              select-none
            "
          >
            <span className="absolute inset-0 blur-3xl opacity-20 bg-primary rounded-full" />

            <span className="relative z-10">
              Pixel
              <br />

              <span
                className="
                  italic
                  bg-gradient-to-r
                  from-primary
                  via-cyan-400
                  to-blue-500
                  bg-clip-text
                  text-transparent
                  drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]
                "
              >
                Ghost
              </span>
            </span>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100px', opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="
                mx-auto
                mt-4
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-transparent
                via-cyan-400
                to-transparent
                shadow-[0_0_15px_rgba(34,211,238,0.5)]
              "
            />
          </motion.h1>

        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {[
          {
            id: 'hide',
            label: 'Hide Data',
            desc: 'Embed encrypted payload',
            icon: Lock,
            color: 'cyan',
          },
          {
            id: 'extract',
            label: 'Extract Data',
            desc: 'Recover hidden message',
            icon: Unlock,
            color: 'emerald',
          },
          {
            id: 'scanner',
            label: 'Scanner',
            desc: 'Detect LSB artifacts',
            icon: Search,
            color: 'amber',
          },
          {
            id: 'chat',
            label: 'Secure Chat',
            desc: 'Stego messaging',
            icon: MessageSquare,
            color: 'purple',
          },
          {
            id: 'deniable',
            label: 'Deniable',
            desc: 'Plausible deniability',
            icon: EyeOff,
            color: 'blue',
          },
          {
            id: 'settings',
            label: 'Settings',
            desc: 'Configure system',
            icon: LayoutDashboard,
            color: 'grey',
          },
        ].map((action, idx) => (

          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onPageChange(action.id)}
            className={cn(
              'group relative rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md p-5 overflow-hidden transition-all duration-300',
              'hover:scale-[1.02] hover:shadow-xl'
            )}
          >

            {/* Hover Glow */}
            <div
              className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500',
                action.color === 'cyan' && 'bg-cyan-500/10',
                action.color === 'emerald' && 'bg-emerald-500/10',
                action.color === 'amber' && 'bg-amber-500/10',
                action.color === 'purple' && 'bg-purple-500/10',
                action.color === 'blue' && 'bg-blue-500/10',
                action.color === 'grey' && 'bg-gray-500/10'
              )}
            />

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 mb-3 flex h-15 w-15 items-center justify-center rounded-xl transition-all duration-300',

                action.color === 'cyan' &&
                  'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black',

                action.color === 'emerald' &&
                  'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black',

                action.color === 'amber' &&
                  'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black',

                action.color === 'purple' &&
                  'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-black',

                action.color === 'blue' &&
                  'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-black',

                action.color === 'grey' &&
                  'bg-gray-500/10 text-gray-400 group-hover:bg-gray-500 group-hover:text-black'
              )}
            >
              <action.icon size={18} />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-2xl font-bold text-foreground">
              {action.label}
            </h3>

            {/* Desc */}
            <p className="relative z-10 mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {action.desc}
            </p>

          </motion.button>
        ))}
      </section>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Capability */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card/40 p-5">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              System Capability
            </h2>

            <span className="rounded bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-primary">
              Live
            </span>
          </div>

          <div className="space-y-6">

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Maximum Payload</span>

                <span className="font-mono text-foreground">
                  12.4 MB
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {[
                {
                  label: 'Cipher',
                  value: 'AES-256-GCM',
                },
                {
                  label: 'KDF',
                  value: 'PBKDF2',
                },
                {
                  label: 'Integrity',
                  value: 'GCM Tag',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-background/40 p-4"
                >
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </div>

                  <div className="text-xs font-bold font-mono text-primary">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Operations */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card/40 p-5 flex flex-col">

          <h2 className="mb-5 text-base font-bold text-foreground">
            Recent Operations
          </h2>

          <div className="space-y-3 flex-1">

            {recentLogs.length === 0 ? (

              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border p-6 text-center opacity-50">
                <ShieldCheck
                  size={34}
                  className="mb-2 text-muted-foreground/30"
                />

                <p className="text-xs text-muted-foreground">
                  No active operations found.
                </p>
              </div>

            ) : (

              recentLogs.slice(0, 4).map((log) => (

                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3 transition-colors hover:border-primary/50"
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={cn(
                        'flex items-center justify-center rounded-lg p-2',
                        log.type === 'embed'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-emerald-500/10 text-emerald-500'
                      )}
                    >
                      {log.type === 'embed' ? (
                        <Lock size={14} />
                      ) : (
                        <Unlock size={14} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground">
                        {log.details.split(' into ')[0]}
                      </div>

                      <div className="truncate text-[9px] lowercase text-muted-foreground">
                        {log.type === 'embed'
                          ? 'Secured'
                          : 'Recovered'}{' '}
                        •{' '}
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      'text-[9px] font-bold tracking-widest',
                      log.status === 'success'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    )}
                  >
                    {log.status === 'success'
                      ? 'SUCCESS'
                      : 'FAILED'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}