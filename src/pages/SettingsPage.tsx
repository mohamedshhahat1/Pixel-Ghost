import React from 'react';
import {
  Moon,
  Sun,
  Shield,
  Monitor,
  Zap,
  KeyRound,
  Copy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';

import { useStegoStore } from '../store/useStegoStore';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { securityLevel, setSecurityLevel, theme, setTheme } =
    useStegoStore();

  const [generatedPassword, setGeneratedPassword] = React.useState('');

  const generateSecurePassword = () => {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

    const randomValues = new Uint32Array(32);

    crypto.getRandomValues(randomValues);

    const password = Array.from(randomValues)
      .map((x) => charset[x % charset.length])
      .join('');

    setGeneratedPassword(password);
  };

  const copyPassword = async () => {
    if (!generatedPassword) return;

    await navigator.clipboard.writeText(generatedPassword);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight uppercase">
          Settings
        </h1>

        <p className="text-muted-foreground">
          Manage appearance, encryption level, and secure password generation.
        </p>
      </div>

      {/* Theme */}
      <Card className="overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-xl">

  {/* Header */}
  <CardHeader className="border-b border-border/60 bg-secondary/20">

    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight">
      <Sun className="text-amber-400" size={20} />
      Appearance
    </CardTitle>

    <CardDescription className="text-muted-foreground">
      Customize your interface environment
    </CardDescription>

  </CardHeader>

  {/* Content */}
  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">

    {/* LIGHT MODE */}
    <button
      onClick={() => setTheme('light')}
      className={cn(
        `
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        p-6
        text-left
        transition-all
        duration-300
        `,
        theme === 'light'
          ? `
            border-amber-400/40
            bg-gradient-to-br
            from-amber-500/15
            via-yellow-500/10
            to-orange-500/10
            shadow-[0_0_30px_rgba(251,191,36,0.15)]
          `
          : `
            border-border
            bg-background/40
            hover:border-amber-400/30
            hover:bg-amber-500/[0.03]
          `
      )}
    >

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex items-start justify-between">

        <div className="space-y-4">

          <div
            className={cn(
              `
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              transition-all
              `,
              theme === 'light'
                ? `
                  bg-gradient-to-br
                  from-amber-400
                  to-orange-500
                  text-white
                  shadow-[0_0_20px_rgba(251,191,36,0.45)]
                `
                : `
                  bg-secondary
                  text-muted-foreground
                  group-hover:text-amber-400
                `
            )}
          >
            <Sun size={24} />
          </div>

          <div>
            <div className="text-lg font-black uppercase tracking-tight">
              Light Mode
            </div>

            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Tactical daylight interface
            </div>
          </div>

        </div>

        {theme === 'light' && (
          <div className="mt-1 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
        )}

      </div>
    </button>

    {/* DARK MODE */}
    <button
      onClick={() => setTheme('dark')}
      className={cn(
        `
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        p-6
        text-left
        transition-all
        duration-300
        `,
        theme === 'dark'
          ? `
            border-cyan-400/40
            bg-gradient-to-br
            from-cyan-500/15
            via-blue-500/10
            to-indigo-500/10
            shadow-[0_0_30px_rgba(34,211,238,0.15)]
          `
          : `
            border-border
            bg-background/40
            hover:border-cyan-400/30
            hover:bg-cyan-500/[0.03]
          `
      )}
    >

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex items-start justify-between">

        <div className="space-y-4">

          <div
            className={cn(
              `
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              transition-all
              `,
              theme === 'dark'
                ? `
                  bg-gradient-to-br
                  from-cyan-400
                  to-blue-500
                  text-white
                  shadow-[0_0_20px_rgba(34,211,238,0.45)]
                `
                : `
                  bg-secondary
                  text-muted-foreground
                  group-hover:text-cyan-400
                `
            )}
          >
            <Moon size={24} />
          </div>

          <div>
            <div className="text-lg font-black uppercase tracking-tight">
              Dark Mode
            </div>

            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Cyber stealth environment
            </div>
          </div>

        </div>

        {theme === 'dark' && (
          <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
        )}

      </div>
    </button>

  </CardContent>
</Card>
{/* Password Generator */}
<Card className="rounded-3xl border-border bg-card/40 backdrop-blur-xl">

<CardHeader>
  <CardTitle className="flex items-center gap-3 text-lg font-black uppercase">
    <KeyRound className="text-primary" size={20} />
    Password Generator
  </CardTitle>

  <CardDescription>
    Generate a secure 32-character password
  </CardDescription>
</CardHeader>

<CardContent className="space-y-6">

  {/* Password */}
  <div className="rounded-2xl border border-border bg-background/50 p-5">

    <div className="mb-3 flex items-center justify-between">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Generated Password
      </span>

      <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
        SECURE
      </Badge>
    </div>

    <div className="break-all font-mono text-sm text-cyan-300">
      {generatedPassword || 'Click generate to create password'}
    </div>

  </div>

  {/* Actions */}
  <div className="flex flex-col sm:flex-row gap-4">

    <Button
      onClick={generateSecurePassword}
      className="flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-[0.2em]"
    >
      Generate Password
    </Button>

    <Button
      variant="secondary"
      onClick={copyPassword}
      disabled={!generatedPassword}
      className="h-12 rounded-2xl px-6"
    >
      <Copy size={16} />
    </Button>

  </div>

</CardContent>
</Card>
      {/* Security Level */}
      <Card className="overflow-hidden rounded-3xl border border-border bg-card/40 backdrop-blur-xl">

  {/* Header */}
  <CardHeader className="border-b border-border/60 bg-secondary/20">

    <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tight">
      <Shield className="text-cyan-400" size={20} />
      Security Architecture
    </CardTitle>

    <CardDescription className="text-muted-foreground">
      Core encryption and steganography specifications
    </CardDescription>

  </CardHeader>

  {/* Content */}
  <CardContent className="p-6">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {[
        {
          label: 'Algorithm',
          value: 'AES-256-GCM',
        },
        {
          label: 'Key Length',
          value: '256 bits',
        },
        {
          label: 'Key Derivation',
          value: 'PBKDF2-SHA256',
        },
        {
          label: 'KDF Iterations',
          value: '250,000',
        },
        {
          label: 'Auth Tag',
          value: '128 bits (GCM)',
        },
        {
          label: 'IV / Nonce',
          value: '96 bits random',
        },
        {
          label: 'Stego Method',
          value: 'LSB (1 bit/channel)',
        },
        {
          label: 'Channels Used',
          value: 'R, G, B (not Alpha)',
        },
        {
          label: 'Output Format',
          value: 'PNG (lossless)',
        },
        {
          label: 'Processing',
          value: '100% browser-local',
        },
      ].map((item) => (
        <div
          key={item.label}
          className="
            group
            rounded-2xl
            border
            border-border
            bg-background/40
            p-5
            transition-all
            duration-300
            hover:border-cyan-400/30
            hover:bg-cyan-500/[0.03]
          "
        >

          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
          </div>

          <div className="font-mono text-sm font-semibold text-cyan-300 break-all">
            {item.value}
          </div>

        </div>
      ))}

    </div>

  </CardContent>
</Card>
    </div>
  );
}