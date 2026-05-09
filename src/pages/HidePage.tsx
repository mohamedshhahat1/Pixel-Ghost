import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  ShieldAlert, 
  Info, 
  Download, 
  ChevronRight,
  Eye,
  EyeOff,
  Settings2,
  Trash2,
  FileUp,
  Cpu,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dropzone } from '../components/Dropzone';
import { CryptoEngine } from '../crypto/cryptoEngine';
import { StegoEngine } from '../stego/stegoEngine';
import { PayloadType } from '../types/crypto';
import { useStegoStore } from '../store/useStegoStore';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import confetti from 'canvas-confetti';

export function HidePage() {
  const addLog = useStegoStore(state => state.addLog);
  const [image, setImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [payloadType, setPayloadType] = React.useState<PayloadType>(PayloadType.TEXT);
  const [secretText, setSecretText] = React.useState('');
  const [secretFile, setSecretFile] = React.useState<File | null>(null);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [statusText, setStatusText] = React.useState('');
  const [finalImage, setFinalImage] = React.useState<string | null>(null);

  const [capacity, setCapacity] = React.useState<{ total: number; used: number }>({ total: 0, used: 0 });

  React.useEffect(() => {
    if (!previewUrl) {
      setCapacity({ total: 0, used: 0 });
      return;
    }

    const img = new Image();
    img.onload = () => {
      const cap = StegoEngine.getCapacity(img.width, img.height);
      const used = payloadType === PayloadType.TEXT 
        ? new TextEncoder().encode(secretText).length 
        : (secretFile?.size || 0);
      
      setCapacity({ total: cap, used: used + 128 }); // Approx overhead
    };
    img.src = previewUrl;
  }, [previewUrl, secretText, secretFile, payloadType]);

  const handleImageSelect = (file: File) => {
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFinalImage(null);
  };

  const handleProcess = async () => {
    if (!image || !password || (payloadType === PayloadType.TEXT && !secretText) || (payloadType === PayloadType.FILE && !secretFile)) return;

    setIsProcessing(true);
    setProgress(0);
    setStatusText('Deriving cryptographic key...');

    try {
      // 1. Prepare data
      const dataToEncrypt = payloadType === PayloadType.TEXT 
        ? new TextEncoder().encode(secretText)
        : new Uint8Array(await secretFile!.arrayBuffer());

      // 2. Encrypt
      setProgress(20);
      setStatusText('Encrypting payload (AES-256-GCM)...');
      const encrypted = await CryptoEngine.encrypt(dataToEncrypt, password);

      // 3. Embed
      setProgress(50);
      setStatusText('Processing image pixels...');
      
      const img = new Image();
      img.src = previewUrl!;
      await new Promise(resolve => img.onload = resolve);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      setProgress(70);
      setStatusText('Embedding hidden data (LSB)...');
      
      const fileName = payloadType === PayloadType.FILE ? secretFile!.name : '';
      const embeddedData = await StegoEngine.embed(imageData, encrypted, payloadType, fileName);
      
      ctx.putImageData(embeddedData, 0, 0);
      
      // 4. Finalize
      setProgress(90);
      setStatusText('Generating PNG container...');
      
      const resultDataUrl = canvas.toDataURL('image/png');
      setFinalImage(resultDataUrl);
      
      setProgress(100);
      setStatusText('Operation complete.');
      
      addLog({
        type: 'embed',
        status: 'success',
        details: `Encrypted ${payloadType === PayloadType.TEXT ? 'text' : secretFile!.name} into ${image.name}`,
        payloadType,
      });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#3b82f6', '#020617']
      });

    } catch (err: any) {
      console.error(err);
      setStatusText(`Error: ${err.message}`);
      addLog({
        type: 'embed',
        status: 'failure',
        details: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const usedPercentage = Math.min((capacity.used / capacity.total) * 100, 100);
  const isOverCapacity = capacity.used > capacity.total && capacity.total > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="relative">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Hide Data</h2>
        <p className="text-muted-foreground text-lg">Securely embed encrypted payloads into ordinary host images.</p>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: host image */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-card/40 border-border rounded-2xl overflow-hidden shadow-2xl">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/20 flex flex-row items-center justify-between">
              <CardTitle className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <ImageIcon size={14} className="text-primary" />
                Host Image Selection
              </CardTitle>
              {image && (
                <Badge variant="outline" className="text-[9px] font-mono border-border bg-secondary/50 text-muted-foreground">
                  {image.name}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <Dropzone 
                onFileSelect={handleImageSelect} 
                preview={previewUrl || undefined}
                onClear={() => { setImage(null); setPreviewUrl(null); setFinalImage(null); }}
              />
            </CardContent>
          </Card>

          {/* Capacity Analyzer */}
          <Card className="bg-card/40 border-border rounded-2xl shadow-xl">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Cpu size={14} className="text-primary" />
                Bitstream Capacity Analyzer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold tracking-tight uppercase">
                  <span className="text-muted-foreground">Payload Density / Storage Limit</span>
                  <span className={cn("font-mono", isOverCapacity ? "text-red-500" : "text-primary")}>
                    {capacity.used}B / {capacity.total}B
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${usedPercentage}%` }}
                    className={cn("h-full rounded-full transition-all duration-500", isOverCapacity ? "bg-red-500" : "bg-gradient-to-r from-primary to-primary/60")} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'System Preamble', value: '128B', color: 'text-muted-foreground' },
                  { label: 'Encrypted Payload', value: `${capacity.used > 128 ? capacity.used - 128 : 0}B`, color: 'text-foreground' },
                  { label: 'Remaining Buffer', value: `${Math.max(0, capacity.total - capacity.used)}B`, color: 'text-emerald-500' },
                ].map((item) => (
                  <div key={item.label} className="p-3 bg-background/40 rounded-xl border border-border/50">
                    <div className="text-[9px] text-muted-foreground uppercase mb-1 font-bold tracking-wide">{item.label}</div>
                    <div className={cn("text-xs font-mono font-bold", item.color)}>{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/40 border-border rounded-2xl shadow-xl">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Settings2 size={14} className="text-primary" />
                Payload Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              {/* Type Toggle */}
              <div className="space-y-4">
  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
    Format
  </label>

  {/* Container */}
  <div className="relative flex items-center gap-1 p-1.5 rounded-xl bg-background/40 border border-border backdrop-blur-md">

    {/* Active Indicator */}
    <div
      className={cn(
        "absolute top-1 bottom-1 w-[calc(50%-6px)] rounded-lg transition-all duration-300",
        "bg-cyan-500/15 border border-cyan-400/30 shadow-[0_0_12px_rgba(34,211,238,0.25)]",
        payloadType === PayloadType.FILE
          ? "left-[calc(50%+3px)]"
          : "left-1"
      )}
    />

    {/* TEXT */}
    <button
      onClick={() => setPayloadType(PayloadType.TEXT)}
      className={cn(
        "relative z-10 flex-1 h-9 text-xs font-bold rounded-lg transition-all",
        payloadType === PayloadType.TEXT
          ? "text-cyan-300"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Encrypted Text
    </button>

    {/* FILE */}
    <button
      onClick={() => setPayloadType(PayloadType.FILE)}
      className={cn(
        "relative z-10 flex-1 h-9 text-xs font-bold rounded-lg transition-all",
        payloadType === PayloadType.FILE
          ? "text-cyan-300"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Secure Binary
    </button>

  </div>
</div>

              {/* Data Input */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  {payloadType === PayloadType.TEXT ? 'Sensitive Message Data' : 'Secret Source File'}
                </label>
                {payloadType === PayloadType.TEXT ? (
                  <textarea 
                    value={secretText}
                    onChange={(e) => setSecretText(e.target.value)}
                    placeholder="Enter message to hide..."
                    className="w-full h-32 bg-background/60 border border-border rounded-xl p-4 text-sm text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all resize-none placeholder:text-muted-foreground/40"
                  />
                ) : (
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="secret-file"
                      className="hidden"
                      onChange={(e) => setSecretFile(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="secret-file"
                      className="flex items-center justify-center gap-3 p-5 bg-background/60 border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-all group-hover:bg-background"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center">
                        <FileUp size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground font-bold truncate">
                          {secretFile ? secretFile.name : 'Choose File'}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">Select target binary</div>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50 w-full" />

              {/* Security */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Access Key</label>
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest"
                    >
                      {showPassword ? 'Hide Key' : 'Show Key'}
                    </button>
                  </div>
                  <div className="relative">
                    <Input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passphrase for AES-256 derivation..."
                      className="h-12 bg-background/60 border-border rounded-xl px-4 text-foreground placeholder:text-muted-foreground/40"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded bg-primary/10 border border-primary/20">
                      <Lock size={14} className="text-primary" />
                    </div>
                  </div>
                  <PasswordStrengthMeter password={password} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-primary/70 uppercase tracking-wider">Armor Engine</div>
                      <div className="text-[11px] font-bold text-muted-foreground">250k PBKDF2 Iterations</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 rounded text-[9px] font-bold text-primary uppercase border border-primary/20">Active</div>
                </div>
              </div>

              <Button 
                onClick={handleProcess}
                disabled={
                  isProcessing || 
                  !image || 
                  !password || 
                  isOverCapacity || 
                  (payloadType === PayloadType.TEXT ? !secretText : !secretFile)
                }
                className="w-full h-14 rounded-xl text-md font-extrabold uppercase tracking-widest shadow-[0_4px_20px_-5px_rgba(6,182,212,0.4)] bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-95"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-3">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap size={18} />
                    </motion.div>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock size={18} />
                    Generate Secure Image
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {finalImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
          >
            <Card className="bg-card border-primary/40 relative overflow-hidden shadow-[0_0_50px_-12px_rgba(6,182,212,0.3)]">
            <div className="absolute top-0 right-0 p-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground font-extrabold text-[10px] rounded-lg tracking-widest uppercase">
                <ShieldAlert size={12} />
                READY FOR DOWNLOAD
              </div>
            </div>
            <CardContent className="p-10 flex flex-col items-center">
              <h3 className="text-3xl font-extrabold mb-8 text-foreground tracking-tight">
                Vault Image <span className="text-primary">Secured</span>
              </h3>
              
              <div className="relative group max-w-md mb-10">
                <div className="absolute -inset-2 bg-primary/20 rounded-2xl blur-xl animate-pulse" />
                <img src={finalImage} alt="Final" className="relative rounded-xl border border-border shadow-2xl" />
              </div>

              <div className="flex gap-4">
                <Button asChild size="lg" className="rounded-xl px-10 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest">
                  <a href={finalImage} download="stegvault_container.png">
                    <Download className="mr-2 w-5 h-5" />
                    Download PNG
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-xl px-10 h-12 border-border bg-card/50 text-muted-foreground font-bold uppercase tracking-widest hover:bg-secondary"
                  onClick={() => { setFinalImage(null); setImage(null); setPreviewUrl(null); setSecretText(''); setSecretFile(null); }}
                >
                  <Trash2 className="mr-2 w-5 h-5" />
                  Clear Task
                </Button>
              </div>
              
              <div className="mt-10 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 max-w-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="text-amber-500" size={18} />
                  <span className="text-xs font-extrabold text-amber-500 uppercase tracking-widest">Important Security Note</span>
                </div>
                <p className="text-xs text-amber-500/70 leading-relaxed font-medium">
                  Social media platforms and messengers often re-compress images (JPEG transformation), which will permanently destroy the hidden bitstream. 
                  Always transmit the vault file as a raw "Document" or via secure cloud links to guarantee data recovery.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Processing Overlay */}
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
                  animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative w-28 h-28 rounded-3xl bg-card border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                  <Cpu size={56} className="animate-pulse" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight uppercase border-r-2 border-primary pr-2 w-fit mx-auto animate-typing overflow-hidden whitespace-nowrap">
                  {statusText}
                </h3>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">AES-256 Engine Active</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] font-bold text-primary/60 tracking-widest uppercase">
                  <span>Quantum Resistance Buffering</span>
                  <span>{progress}% SECURED</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
    
  );
}
