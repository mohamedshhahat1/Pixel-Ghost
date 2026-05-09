import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  BarChart3,
  Eye,
  Activity,
  AlertTriangle,
  ShieldCheck,
  FileSearch,
  Scan,
  Cpu,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

import { cn } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Dropzone } from '../components/Dropzone';

import { StegoEngine } from '@/stego/stegoEngine';
import { PayloadType } from '@/types/crypto';

export function ScannerPage() {
  const [image, setImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [isScanning, setIsScanning] = React.useState(false);

  const [scanResult, setScanResult] = React.useState<{
    entropy: number;
    lsbScore: number;
    bitDistribution: { name: string; value: number; color: string }[];
    hasEncryptedPayload: boolean;
    payloadType?: PayloadType;
    payloadSize?: number;
    isSuspicious: boolean;
  } | null>(null);

  const [heatmapUrl, setHeatmapUrl] = React.useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setHeatmapUrl(null);
  };

  const runAnalysis = async () => {
    if (!previewUrl) return;

    setIsScanning(true);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    try {
      const img = new Image();
      img.src = previewUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const data = imageData.data;

      let zeroes = 0;
      let ones = 0;

      const sampleSize = Math.min(data.length, 100000);

      for (let i = 0; i < sampleSize; i += 4) {
        if ((data[i] & 1) === 0) zeroes++;
        else ones++;

        if ((data[i + 1] & 1) === 0) zeroes++;
        else ones++;

        if ((data[i + 2] & 1) === 0) zeroes++;
        else ones++;
      }

      /* Heatmap */
      const heatmapCanvas = document.createElement('canvas');

      heatmapCanvas.width = img.width;
      heatmapCanvas.height = img.height;

      const hCtx = heatmapCanvas.getContext('2d')!;
      const hData = hCtx.createImageData(img.width, img.height);

      for (let i = 0; i < data.length; i += 4) {
        const lsbOnes =
          (data[i] & 1) +
          (data[i + 1] & 1) +
          (data[i + 2] & 1);

        if (lsbOnes >= 2) {
          hData.data[i] = 34;
          hData.data[i + 1] = 211;
          hData.data[i + 2] = 238;
          hData.data[i + 3] = 80;
        } else {
          hData.data[i + 3] = 0;
        }
      }

      hCtx.putImageData(hData, 0, 0);

      setHeatmapUrl(heatmapCanvas.toDataURL());

      const totalBits = zeroes + ones;

      const p0 = zeroes / totalBits;
      const p1 = ones / totalBits;

      const entropy =
        -(
          (p0 > 0 ? p0 * Math.log2(p0) : 0) +
          (p1 > 0 ? p1 * Math.log2(p1) : 0)
        );

      const lsbBalance =
        1 - Math.abs(zeroes - ones) / totalBits;

      const lsbScore = Math.round(lsbBalance * 100);

      let hasEncryptedPayload = false;
      let payloadType: PayloadType | undefined;
      let payloadSize: number | undefined;

      try {
        const extracted = await StegoEngine.extract(imageData);

        hasEncryptedPayload = true;
        payloadType = extracted.metadata.type;
        payloadSize = extracted.metadata.payloadSize;
      } catch {
        hasEncryptedPayload = false;
      }

      setScanResult({
        entropy,
        lsbScore,
        bitDistribution: [
          {
            name: '0 Bits',
            value: zeroes,
            color: '#3b82f6',
          },
          {
            name: '1 Bits',
            value: ones,
            color: '#22d3ee',
          },
        ],
        hasEncryptedPayload,
        payloadType,
        payloadSize,
        isSuspicious:
          hasEncryptedPayload || lsbScore > 85,
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-12">
      {/* Header */}
      <div className="relative">
        <h2 className="text-3xl font-black tracking-tight text-foreground">
          Image Scanner
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Detect hidden encrypted payloads and analyze
          image entropy patterns.
        </p>

        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl -z-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload */}
        <div
          className={cn(
            'transition-all duration-500',
            scanResult
              ? 'lg:col-span-4'
              : 'lg:col-span-12 max-w-2xl mx-auto w-full'
          )}
        >
          <Card className="rounded-3xl border-border bg-card/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-secondary/20">
              <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                <FileSearch size={14} className="text-primary" />
                Scan Target
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">
              <Dropzone
                onFileSelect={handleImageSelect}
                preview={previewUrl || undefined}
                onClear={() => {
                  setImage(null);
                  setPreviewUrl(null);
                  setScanResult(null);
                }}
                label="Upload image"
              />

              {previewUrl && !scanResult && (
                <Button
                  onClick={runAnalysis}
                  disabled={isScanning}
                  className="mt-5 h-12 w-full rounded-2xl font-black uppercase tracking-[0.2em]"
                >
                  {isScanning
                    ? 'Scanning...'
                    : 'Start Scan'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Entropy */}
            <Card className="rounded-3xl border-border bg-card/40 backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-secondary/20">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Activity
                    size={14}
                    className="text-primary"
                  />
                  Entropy Analysis
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-7">
                <div className="text-center">
                  <div className="text-5xl font-black font-mono text-primary">
                    {(scanResult.entropy * 100).toFixed(1)}%
                  </div>

                  <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold">
                    Entropy Score
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
                    <span>LSB Variation</span>

                    <span className="text-primary">
                      {scanResult.lsbScore}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-background overflow-hidden border border-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${scanResult.lsbScore}%`,
                      }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-2xl border p-4 flex gap-4',
                    scanResult.hasEncryptedPayload
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : scanResult.isSuspicious
                      ? 'border-amber-500/20 bg-amber-500/5 text-amber-500'
                      : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
                  )}
                >
                  <div className="mt-0.5">
                    {scanResult.hasEncryptedPayload ? (
                      <ShieldCheck size={20} />
                    ) : scanResult.isSuspicious ? (
                      <AlertTriangle size={20} />
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em]">
                      {scanResult.hasEncryptedPayload
                        ? 'Encrypted Payload Detected'
                        : scanResult.isSuspicious
                        ? 'Suspicious Pattern'
                        : 'No Payload Detected'}
                    </h4>

                    <p className="mt-2 text-xs leading-relaxed opacity-80">
                      {scanResult.hasEncryptedPayload
                        ? `Embedded ${
                            scanResult.payloadType ===
                            PayloadType.FILE
                              ? 'file'
                              : 'text'
                          } payload detected (${scanResult.payloadSize} bytes).`
                        : scanResult.isSuspicious
                        ? 'Image contains unusual LSB statistics.'
                        : 'Image appears clean with natural bit distribution.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="rounded-3xl border-border bg-card/40 backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-secondary/20">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <BarChart3
                    size={14}
                    className="text-primary"
                  />
                  Bit Distribution
                </CardTitle>
              </CardHeader>

              <CardContent className="h-[260px] p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scanResult.bitDistribution}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'currentColor',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    />

                    <YAxis hide />

                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                    />

                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                    >
                      {scanResult.bitDistribution.map(
                        (entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.color}
                          />
                        )
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <Card className="md:col-span-2 rounded-3xl border-border bg-card/40 backdrop-blur-xl overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-secondary/20">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Scan size={14} className="text-primary" />
                  LSB Heatmap
                </CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
                  <img
                    src={previewUrl!}
                    alt="Source"
                    className="w-full h-full object-contain opacity-40 grayscale"
                  />

                  <img
                    src={heatmapUrl!}
                    alt="Heatmap"
                    className="absolute inset-0 w-full h-full object-contain mix-blend-screen"
                  />
                </div>

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-primary">
                      <Eye size={18} />
                    </div>

                    <div>
                      <h4 className="text-sm font-black uppercase">
                        LSB Detection
                      </h4>

                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Cyan highlights indicate pixels with
                        unusual LSB patterns commonly linked
                        to hidden payloads.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      'Chi-Square',
                      'Frequency',
                      'Spatial',
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-lg border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setHeatmapUrl(null)}
                    className="w-full rounded-2xl h-11 text-xs font-black uppercase tracking-[0.2em]"
                  >
                    Reset Heatmap
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl"
          >
            <div className="space-y-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/30 bg-card text-primary shadow-[0_0_40px_rgba(6,182,212,0.15)]"
              >
                <Cpu size={46} />
              </motion.div>

              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground">
                  Running Deep Scan
                </h3>

                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Analyzing LSB structures...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}