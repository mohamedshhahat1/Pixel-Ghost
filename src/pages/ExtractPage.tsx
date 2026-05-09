import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Download, 
  Trash2, 
  Key,
  FileText,
  Binary,
  AlertCircle,
  Zap,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dropzone } from '../components/Dropzone';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter';
import { CryptoEngine } from '../crypto/cryptoEngine';
import { StegoEngine } from '../stego/stegoEngine';
import { PayloadType, StegoMetadata } from '../types/crypto';
import { useStegoStore } from '../store/useStegoStore';
import confetti from 'canvas-confetti';

export function ExtractPage() {
  const addLog = useStegoStore(state => state.addLog);
  const [image, setImage] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  
  const [extractedData, setExtractedData] = React.useState<{
    payload: Uint8Array;
    metadata: StegoMetadata;
    decryptedText?: string;
  } | null>(null);

  const handleImageSelect = (file: File) => {
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExtractedData(null);
    setStatus('idle');
  };

  const handleExtract = async () => {
    if (!image || !password) return;

    setIsProcessing(true);
    setStatus('processing');
    setErrorMessage('');

    try {
      // 1. Load image onto canvas
      const img = new Image();
      img.src = previewUrl!;
      await new Promise(resolve => img.onload = resolve);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 2. Extract LSB
      const { payload: encryptedPayload, metadata } = await StegoEngine.extract(imageData);

      // 3. Decrypt
      const decrypted = await CryptoEngine.decrypt(encryptedPayload, password);

      let decryptedText: string | undefined;
      if (metadata.type === PayloadType.TEXT) {
        decryptedText = new TextDecoder().decode(decrypted);
      }

      setExtractedData({
        payload: decrypted,
        metadata,
        decryptedText
      });
      
      setStatus('success');
      addLog({
        type: 'extract',
        status: 'success',
        details: `Decrypted ${metadata.type === PayloadType.TEXT ? 'text' : metadata.fileName} from vault`,
        payloadType: metadata.type
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#3b82f6']
      });

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message === 'No StegVault payload detected in image' 
        ? 'No hidden data found or image has been compressed.' 
        : 'Decryption failed. Incorrect password or data corruption.');
      
      addLog({
        type: 'extract',
        status: 'failure',
        details: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadFile = () => {
    if (!extractedData || !extractedData.metadata.fileName) return;
    
    const blob = new Blob([extractedData.payload]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = extractedData.metadata.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="relative">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">Extract Data</h2>
        <p className="text-muted-foreground text-lg font-medium">Decrypt and retrieve hidden payloads from ordinary vault images.</p>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Host Image Input */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-card/40 border-border rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Unlock size={14} className="text-primary" />
                Vault Source Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Dropzone 
                onFileSelect={handleImageSelect} 
                preview={previewUrl || undefined}
                onClear={() => { setImage(null); setPreviewUrl(null); setExtractedData(null); setStatus('idle'); }}
                label="Drop vault image to begin recovery"
              />
            </CardContent>
          </Card>

          
        </div>

        {/* Credentials & Results */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="bg-card/40 border-border rounded-2xl shadow-xl">
            <CardHeader className="p-4 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                <Key size={14} className="text-primary" />
                Security Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Master Vault Password</label>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest">
                    {showPassword ? 'Mask Key' : 'Show Key'}
                  </button>
                </div>
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter decryption passphrase..."
                  className="h-12 bg-background/60 border-border rounded-xl px-4 text-foreground transition-colors"
                  disabled={isProcessing}
                />
                <PasswordStrengthMeter password={password} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background/40 border border-border rounded-xl text-center">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">KDF Iterations</div>
                  <div className="text-xs font-mono font-bold text-foreground">250,000</div>
                </div>
                <div className="p-3 bg-background/40 border border-border rounded-xl text-center">
                  <div className="text-[9px] text-muted-foreground uppercase font-bold mb-1">Crypto Standard</div>
                  <div className="text-xs font-mono font-bold text-foreground">AES-GCM</div>
                </div>
              </div>

              <Button
  onClick={handleExtract}
  disabled={isProcessing || !image || !password}
  className={cn(
    "relative w-full h-14 rounded-xl font-extrabold uppercase tracking-widest",
    "bg-primary text-primary-foreground",
    "shadow-[0_0_25px_rgba(6,182,212,0.25)]",
    "transition-all duration-300",
    "hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(6,182,212,0.45)]",
    "active:scale-95",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 overflow-hidden"
  )}
>
  {/* glow effect layer */}
  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

  {isProcessing ? (
    <span className="flex items-center gap-3 relative z-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Zap size={18} />
      </motion.div>
      <span className="tracking-widest">Decrypting Vault...</span>
    </span>
  ) : (
    <span className="flex items-center gap-2 relative z-10">
      <Unlock size={18} className="transition-transform group-hover:rotate-12" />
      <span>Unlock Vault</span>
    </span>
  )}
</Button>

              {status === 'error' && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-xl border">
                    <AlertCircle size={16} />
                    <AlertTitle className="font-extrabold text-xs uppercase tracking-widest">Authentication Failed</AlertTitle>
                    <AlertDescription className="text-xs font-medium">{errorMessage}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Results Display */}
          {extractedData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-border rounded-2xl shadow-2xl overflow-hidden border-l-4 border-l-emerald-500">
                <CardHeader className="p-4 bg-emerald-500/5 border-b border-border/10">
                  <CardTitle className="text-[11px] font-bold tracking-widest text-emerald-500 uppercase flex items-center gap-2">
                    <ShieldCheck size={14} />
                    Payload Integrity: Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        {extractedData.metadata.type === PayloadType.TEXT ? <FileText size={14} /> : <Binary size={14} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Format</div>
                        <div className="text-xs font-bold text-foreground truncate">{extractedData.metadata.type.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-border">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                        <Cpu size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Size</div>
                        <div className="text-xs font-bold font-mono text-foreground">{extractedData.metadata.payloadSize}B</div>
                      </div>
                    </div>
                  </div>

                  {extractedData.metadata.type === PayloadType.TEXT ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Extracted Intelligence</label>
                      <div className="p-4 rounded-xl bg-background/60 border border-border font-sans text-foreground min-h-[120px] break-all whitespace-pre-wrap text-sm leading-relaxed selection:bg-primary/30 shadow-inner">
                        {extractedData.decryptedText}
                      </div>
                      <Button
  variant="secondary"
  onClick={() =>
    navigator.clipboard.writeText(extractedData?.decryptedText || '')
  }
  className="
    relative group
    w-full h-11
    rounded-xl
    border border-border/60
    bg-background/40 backdrop-blur-md
    text-xs font-bold uppercase tracking-widest
    text-foreground
    transition-all duration-300
    hover:bg-secondary/60
    hover:border-primary/40
    hover:shadow-[0_0_20px_rgba(47,123,255,0.25)]
    hover:-translate-y-0.5
    active:scale-[0.98]
    overflow-hidden
  "
>
  {/* Glow layer */}
  <div className="
    absolute inset-0
    opacity-0 group-hover:opacity-100
    bg-gradient-to-r from-primary/10 via-cyan-400/10 to-primary/10
    transition-all duration-500
  " />

  {/* Text */}
  <span className="relative z-10 flex items-center gap-2">
    Copy to Secure Clipboard
  </span>
</Button>
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-background/40 border border-border text-center space-y-6">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <FileText size={40} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-lg text-foreground truncate px-4">{extractedData.metadata.fileName}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">Binary Object Ready</p>
                      </div>
                      <Button onClick={handleDownloadFile} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Download className="mr-2 w-4 h-4" />
                        Download File
                      </Button>
                    </div>
                  )}

                  <div className="pt-4 flex justify-center">
                  <button
  onClick={() => { setExtractedData(null); setStatus('idle'); }}
  className="
    relative group
    px-4 py-2
    rounded-xl
    border border-border/50
    bg-background/40 backdrop-blur-md
    text-[10px] font-bold uppercase tracking-[0.25em]
    text-muted-foreground
    transition-all duration-300
    hover:text-red-400
    hover:border-red-400/50
    hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]
    hover:-translate-y-0.5
    active:scale-95
    overflow-hidden
  "
>
  {/* glow background */}
  <div className="
    absolute inset-0
    bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0
    group-hover:from-red-500/10 group-hover:via-red-500/5 group-hover:to-red-500/10
    transition-all duration-500
  " />

  {/* text */}
  <span className="relative z-10">
    Purge Memory Cache
  </span>
</button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

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
                  animate={{ scale: [1, 1.05, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative w-28 h-28 rounded-3xl bg-card border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                >
                  <Cpu size={56} className="animate-pulse" />
                </motion.div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight uppercase border-r-2 border-primary pr-2 w-fit mx-auto animate-typing overflow-hidden whitespace-nowrap">
                  Decrypting Vault Stream...
                </h3>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Quantum-Keystore Protocol Active</span>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-1 bg-secondary rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] font-bold text-primary/60 tracking-widest uppercase">
                  <span>Synchronizing Bitstream</span>
                  <span>Recovering Parity</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
