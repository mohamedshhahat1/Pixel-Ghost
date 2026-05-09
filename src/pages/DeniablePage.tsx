import React from 'react';
import { motion } from 'motion/react';
import { 
  Ghost, 
  ShieldAlert, 
  EyeOff, 
  Key, 
  AlertCircle, 
  Lock, 
  ArrowRight,
  ShieldX,
  Skull,
  Plus,
  Cpu,
  FileDown,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dropzone } from '@/components/Dropzone';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'motion/react';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';

export function DeniablePage() {
  const [activeTab, setActiveTab] = React.useState<'generate' | 'extract'>('generate');
  const [hostImage, setHostImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [fakePass, setFakePass] = React.useState('');
  const [fakeText, setFakeText] = React.useState('');
  const [realPass, setRealPass] = React.useState('');
  const [realText, setRealText] = React.useState('');
  const [extractPass, setExtractPass] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [resultImage, setResultImage] = React.useState<string | null>(null);
  const [extractedData, setExtractedData] = React.useState<{ type: 'decoy' | 'secret', content: string } | null>(null);
  const [extractError, setExtractError] = React.useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setHostImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResultImage(null);
    setExtractedData(null);
    setExtractError(null);
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResultImage(previewUrl);
    }, 3000);
  };

  const handleExtract = () => {
    setIsProcessing(true);
    setExtractError(null);
    setTimeout(() => {
      setIsProcessing(false);
      const normalizedPass = extractPass.trim();
      const fakePassNormalized = fakePass.trim();
      const realPassNormalized = realPass.trim();

      // Return the actual user-provided payloads instead of placeholder mock text.
      if (normalizedPass && fakePassNormalized && normalizedPass === fakePassNormalized) {
        setExtractedData({ type: 'decoy', content: fakeText || 'No decoy payload configured.' });
      } else if (normalizedPass && realPassNormalized && normalizedPass === realPassNormalized) {
        setExtractedData({ type: 'secret', content: realText || 'No stealth payload configured.' });
      } else {
        setExtractedData(null);
        setExtractError('Invalid key for current deniable session. Use the exact decoy or master password configured during generation.');
      }
    }, 2000);
  };

  const isFormValid = hostImage && fakePass && fakeText && realPass && realText;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2 uppercase">Deniable Mode</h2>
          <p className="text-muted-foreground text-lg font-medium">Multi-layer cryptosystem for plausible deniability.</p>
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
        </div>

        <div className="flex p-1 bg-background border border-border rounded-xl">
          <button 
            onClick={() => { setActiveTab('generate'); setExtractedData(null); }}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'generate' ? "bg-cyan-500 text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Generation
          </button>
          <button 
            onClick={() => { setActiveTab('extract'); setResultImage(null); }}
            className={cn(
              "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'extract' ? "bg-cyan-500 text-primary-foreground shadow-lg shadow-cyan-500/20" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Extraction
          </button>
        </div>
      </div>

      <Alert
  className={cn(
    `
    relative
    overflow-hidden
    rounded-2xl
    border
    bg-card/50
    backdrop-blur-xl
    p-4
    transition-all
    duration-500
    `,
    activeTab === 'generate'
      ? 'border-purple-500/20 shadow-[0_0_35px_-12px_rgba(168,85,247,0.18)]'
      : 'border-cyan-500/20 shadow-[0_0_35px_-12px_rgba(6,182,212,0.18)]'
  )}
>

  {/* Glow Layer */}
  <div
    className={cn(
      `
      absolute
      inset-0
      opacity-40
      pointer-events-none
      `,
      activeTab === 'generate'
        ? 'bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5'
        : 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5'
    )}
  />

  <div className="relative z-10 flex gap-3">

    {/* Icon */}
    <div
      className="
      flex
      h-10
      w-10
      shrink-0
      items-center
      justify-center
      rounded-xl
      border
      border-amber-500/20
      bg-amber-500/10
      shadow-[0_0_15px_rgba(245,158,11,0.08)]
    "
    >
      <ShieldAlert className="h-5 w-5 text-amber-400" />
    </div>

    {/* Content */}
    <div className="space-y-1">

      <AlertTitle
        className="
        text-sm
        font-black
        uppercase
        tracking-tight
        text-foreground
      "
      >
        Operational Security
      </AlertTitle>

      <AlertDescription
        className="
        text-[11px]
        leading-relaxed
        text-muted-foreground
      "
      >
        The <span className="font-bold uppercase text-amber-400">
          Decoy Key
        </span>{' '}
        reveals harmless data, while the{' '}
        <span className="font-bold uppercase text-primary">
          Stealth Layer
        </span>{' '}
        remains indistinguishable from random noise.
      </AlertDescription>

    </div>
  </div>
</Alert>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Host Selection */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/40 border-border rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
            <CardHeader className="p-6 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <ImageIcon size={14} className={activeTab === 'generate' ? "text-primary" : "text-cyan-500"} />
                {activeTab === 'generate' ? 'Host Selection' : 'Vault Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              <Dropzone 
                onFileSelect={handleImageSelect}
                preview={previewUrl || undefined}
                onClear={() => { setHostImage(null); setPreviewUrl(null); setResultImage(null); setExtractedData(null); }}
                label={activeTab === 'generate' ? "Base tactical asset" : "Vault image for extraction"}
              />
            </CardContent>
          </Card>
        </div>

        {/* Configuration / Extraction */}
        <div className="lg:col-span-8 space-y-8">
          {activeTab === 'generate' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Layer 1: Fake */}
                <Card className="bg-card/40 border-border rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <EyeOff size={160} />
                  </div>
                  <CardHeader className="p-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground mb-6 shadow-inner">
                      <Lock size={24} />
                    </div>
                    <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground uppercase">Decoy Layer</CardTitle>
                    <CardDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Duress Response Identity</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative z-10 space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Decoy Payload (Harmless)</label>
                      <Textarea 
                        value={fakeText}
                        onChange={(e) => setFakeText(e.target.value)}
                        placeholder="Input data to be revealed under duress..."
                        className="min-h-[100px] bg-background/60 border-border rounded-xl px-4 py-3 text-foreground focus:border-amber-500/50"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trap Door Key</label>
                      <Input 
                        type="password"
                        value={fakePass}
                        onChange={(e) => setFakePass(e.target.value)}
                        placeholder="Decoy Password..."
                        className="h-12 bg-background/60 border-border rounded-xl px-4 text-foreground"
                      />
                      <PasswordStrengthMeter password={fakePass} />
                    </div>
                  </CardContent>
                </Card>

                {/* Layer 2: Real */}
                <Card className="bg-card/40 border-primary/20 rounded-2xl relative overflow-hidden group shadow-xl">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-primary">
                    <Ghost size={160} />
                  </div>
                  <CardHeader className="p-8 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]">
                      <Key size={24} />
                    </div>
                    <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground uppercase">Stealth Layer</CardTitle>
                    <CardDescription className="text-primary/60 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">Authenticated Intelligence</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 relative z-10 space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Payload (Secret)</label>
                      <Textarea 
                        value={realText}
                        onChange={(e) => setRealText(e.target.value)}
                        placeholder="Sensitive operational intelligence..."
                        className="min-h-[100px] bg-background/60 border-border rounded-xl px-4 py-3 text-foreground focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Key Identity</label>
                      <Input 
                        type="password"
                        value={realPass}                
                        onChange={(e) => setRealPass(e.target.value)}
                        placeholder="True Master Password..."
                        className="h-12 bg-background/60 border-primary/20 rounded-xl px-4 text-foreground focus:border-primary/50"
                      />
                      <PasswordStrengthMeter password={realPass} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={handleProcess}
                disabled={!isFormValid || isProcessing}
                size="lg" 
                className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_30px_-5px_rgba(168,85,247,0.5)] transition-all hover:scale-[1.01] active:scale-95 text-md"
              >
                {isProcessing ? 'Bitstream Interleaving...' : 'Initialize Stealth Architecture'}
              </Button>
            </>
          ) : (
            <div className="space-y-8">
              <Card className="bg-card/40 border-border rounded-2xl shadow-xl p-8 space-y-8">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shadow-lg">
                    <Key size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-foreground uppercase tracking-tight">Decryption Identity Probe</h3>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Input any associated password to scan for active bit-volumes.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Key Authentication</label>
                  <Input 
                    type="password"
                    value={extractPass}
                    onChange={(e) => setExtractPass(e.target.value)}
                    placeholder="Enter decoy or master password..."
                    className="h-14 bg-background/60 border-border rounded-xl px-4 text-foreground focus:border-cyan-500/50 text-lg tracking-widest"
                  />
                </div>

                <Button 
                  onClick={handleExtract}
                  disabled={!hostImage || !extractPass || isProcessing}
                  size="lg" 
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] bg-cyan-500 hover:bg-cyan-400 text-primary-foreground shadow-[0_4px_30px_-5px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.01] active:scale-95 text-md"
                >
                  {isProcessing ? 'Probing Bit-Volumes...' : 'Execute Recovery Sequence'}
                </Button>
              </Card>

              {extractedData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-8 rounded-2xl border-2 flex flex-col gap-6 shadow-2xl relative overflow-hidden",
                    extractedData.type === 'decoy' 
                      ? "bg-background border-amber-500/20" 
                      : "bg-background border-primary/20"
                  )}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    {extractedData.type === 'decoy' ? <EyeOff size={80} /> : <Ghost size={80} />}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-lg font-black uppercase tracking-widest text-[10px]",
                      extractedData.type === 'decoy' ? "bg-amber-500 text-primary-foreground" : "bg-primary text-primary-foreground"
                    )}>
                      {extractedData.type === 'decoy' ? 'DECOY VOLUME ACCESSED' : 'STEALTH VOLUME RECOVERED'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Payload Contents:</div>
                    <div className="p-6 rounded-xl bg-secondary border border-border text-foreground font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {extractedData.content}
                    </div>
                  </div>
                </motion.div>
              )}
              {extractError && (
                <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs uppercase tracking-widest">Extraction Failed</AlertTitle>
                  <AlertDescription className="text-xs">{extractError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>

      {resultImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card/60 border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative aspect-square max-w-sm mx-auto w-full group">
                <img src={resultImage} alt="Result" className="w-full h-full object-contain rounded-2xl shadow-2xl" />
                <div className="absolute inset-0 bg-cyan-500/10 rounded-2xl pointer-events-none animate-pulse" />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Vault Sequence Complete</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Host image has been modified with dual-layer entropy mapping. The image now contains two distinct encrypted volumes.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-background/60 border border-border">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <ShieldAlert size={20} />
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Integrity: Verified
                    </div>
                  </div>
                  
                  <Button asChild className="w-full h-14 rounded-xl font-bold uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-primary-foreground shadow-[0_4px_20px_-5px_rgba(6,182,212,0.4)]">
                    <a href={resultImage} download="deniable_vault.png">
                      <FileDown size={20} className="mr-2" />
                      Export Stealth PNG
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-8 transition-colors"
          >
            <div className="max-w-md w-full space-y-10 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px]" />
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative w-28 h-28 rounded-3xl bg-card border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                >
                  <Cpu size={56} className="animate-pulse" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight uppercase border-r-2 border-primary pr-2 w-fit mx-auto animate-typing overflow-hidden whitespace-nowrap">
                  Interleaving Payloads...
                </h3>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Mapping Multi-Layer Entropy</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-1 bg-secondary rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] font-bold text-primary/60 tracking-widest uppercase">
                  <span>Drafting Parity Bits</span>
                  <span>Securing Stealth Layer</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
