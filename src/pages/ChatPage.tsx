import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  ImageIcon, 
  Lock, 
  ShieldCheck,
  MoreVertical,
  Terminal,
  Smile,
  Activity,
  Cpu,
  Wifi,
  KeyRound,
  FileCode2,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CryptoEngine } from '../crypto/cryptoEngine';
import { StegoEngine } from '../stego/stegoEngine';
import { PayloadType } from '../types/crypto';

interface Message {
  id: string;
  sender: 'user' | 'system';
  content: string;
  type: 'text' | 'stego';
  image?: string;
  timestamp: number;
  isEncrypted?: boolean;
}

interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  level: 'info' | 'warn' | 'success';
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      sender: 'system', 
      content: 'Local P2P Cipher-Stream established. All outbound traffic is automatically embedded into cover matrices via LSB.', 
      type: 'text', 
      timestamp: Date.now() 
    }
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'l1', timestamp: Date.now(), message: 'SYSTEM INIT: P2P Tunnel 0x8F2C...E912', level: 'info' },
    { id: 'l2', timestamp: Date.now(), message: 'KEY_EXCHANGE: AES-256 Standard', level: 'success' }
  ]);
  
  const [inputText, setInputText] = useState('');
  const[isTyping, setIsTyping] = useState(false);
  const [password] = useState('Pixel-Ghost'); // Standard for demo
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Smart Scroll Refs & State
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const logsScrollRef = useRef<HTMLDivElement>(null);
  const[isChatAtBottom, setIsChatAtBottom] = useState(true);
  const[isLogsAtBottom, setIsLogsAtBottom] = useState(true);

  // Scroll Event Handlers
  const handleChatScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Considered at bottom if within 60px of the end
    setIsChatAtBottom(scrollHeight - scrollTop - clientHeight < 60);
  },[]);

  const handleLogsScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsLogsAtBottom(scrollHeight - scrollTop - clientHeight < 40);
  },[]);

  // Trigger Scroll Methods
  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsChatAtBottom(true);
    }
  },[]);

  const scrollLogsToBottom = useCallback(() => {
    if (logsScrollRef.current) {
      logsScrollRef.current.scrollTo({
        top: logsScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setIsLogsAtBottom(true);
    }
  },[]);

  // Auto-scroll Effects (Only triggers if user is already at the bottom)
  useEffect(() => {
    if (isChatAtBottom) {
      const timeout = setTimeout(scrollToBottom, 50); // Ensure DOM paints
      return () => clearTimeout(timeout);
    }
  },[messages, isTyping, isChatAtBottom, scrollToBottom]);

  useEffect(() => {
    if (isLogsAtBottom) {
      const timeout = setTimeout(scrollLogsToBottom, 50);
      return () => clearTimeout(timeout);
    }
  }, [logs, isLogsAtBottom, scrollLogsToBottom]);

  const addLog = (message: string, level: 'info' | 'warn' | 'success' = 'info') => {
    setLogs(prev =>[...prev, { id: Math.random().toString(), timestamp: Date.now(), message, level }]);
  };

  const createCoverImageDataUrl = useCallback((seedText: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.fillStyle = '#020617'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let acc = 0;
    for (let i = 0; i < seedText.length; i++) {
      acc = (acc + seedText.charCodeAt(i) * (i + 1)) % 9973;
    }

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    for (let i = 0; i < 200; i++) {
      const x = (acc * (i + 13) * 17) % (canvas.width / 10) * 10;
      const y = (acc * (i + 7) * 31) % (canvas.height / 10) * 10;
      const r = ((acc + i * 11) % 255);
      const g = ((acc + i * 13) % 255);
      
      ctx.fillStyle = `rgba(${r}, ${g}, 255, ${0.1 + (i % 5) * 0.05})`;
      ctx.fillRect(x, y, 10, 10);
    }

    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillText('ENCRYPTED STEGO-MATRIX', 20, 30);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.fillText(`HASH: ${(acc * 9999).toString(16).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`, 20, 50);

    return canvas.toDataURL('image/png');
  },[]);

  const handleSend = async () => {
    const content = inputText.trim();
    if (!content || isTyping) return;

    setErrorMessage(null);

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      content,
      type: 'text',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Force scroll to bottom when user sends a message
    setTimeout(scrollToBottom, 50);

    try {
      addLog(`Intercepted plaintext (${content.length} bytes)`, 'info');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      addLog('Generating structural cover matrix...', 'info');
      const coverDataUrl = createCoverImageDataUrl(content);

      const img = new Image();
      img.src = coverDataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load generated cover image'));
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.drawImage(img, 0, 0);

      addLog('Encrypting payload via AES-256...', 'warn');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const encryptedPayload = await CryptoEngine.encrypt(new TextEncoder().encode(content), password);
      
      addLog('Embedding encrypted bits via LSB...', 'warn');
      const embeddedData = await StegoEngine.embed(imageData, encryptedPayload, PayloadType.TEXT);
      ctx.putImageData(embeddedData, 0, 0);
      const stegoDataUrl = canvas.toDataURL('image/png');

      await new Promise(resolve => setTimeout(resolve, 400));
      
      addLog('Validating extraction integrity...', 'info');
      const extracted = await StegoEngine.extract(embeddedData);
      const decrypted = await CryptoEngine.decrypt(extracted.payload, password);
      const decodedText = new TextDecoder().decode(decrypted);

      addLog('Validation success. Payload sealed.', 'success');

      const systemResponse: Message = {
        id: Math.random().toString(),
        sender: 'system',
        content: `Payload recovered successfully: "${decodedText}"`,
        type: 'stego',
        image: stegoDataUrl,
        timestamp: Date.now(),
        isEncrypted: true
      };

      setMessages(prev => [...prev, systemResponse]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown chat processing error';
      setErrorMessage(message);
      addLog(`Pipeline failed: ${message}`, 'warn');
      setMessages(prev =>[
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'system',
          content: `Encryption pipeline failed: ${message}`,
          type: 'text',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex gap-4 lg:gap-6 p-2 sm:p-4 lg:p-6 overflow-hidden">
      
      {/* LEFT: MAIN CHAT PANEL */}
      <Card className="flex-1 bg-background/60 backdrop-blur-2xl border-border/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="h-16 sm:h-20 border-b border-border/50 flex justify-between items-center px-4 sm:px-6 bg-card/40 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.15)]">
                <ShieldCheck size={22} className="text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-wide flex items-center gap-2">
                CIPHER-STREAM
                <Badge variant="secondary" className="hidden sm:flex text-[9px] h-5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 uppercase font-bold tracking-wider">
                  Live
                </Badge>
              </h2>
              <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                <Wifi size={10} /> Tunnel: 0x8F2C...E912
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="bg-destructive/10 border-b border-destructive/20 text-destructive text-xs font-medium px-6 py-3 flex items-center gap-2 shrink-0"
            >
              <Activity size={14} />
              {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Scroll to Bottom Button */}
        <AnimatePresence>
          {!isChatAtBottom && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              className="absolute bottom-[90px] right-6 sm:bottom-[100px] sm:right-10 z-50"
            >
              <Button
                variant="secondary"
                size="icon"
                onClick={scrollToBottom}
                className="h-10 w-10 rounded-full shadow-xl bg-background/90 backdrop-blur-md border border-border text-primary hover:bg-muted transition-colors"
              >
                <ArrowDown size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages Area */}
        <div 
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 p-4 sm:p-6 bg-gradient-to-b from-transparent to-primary/5 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2[&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80"
        >
          <div className="space-y-6 max-w-4xl mx-auto pb-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col max-w-[90%] sm:max-w-[75%]",
                  msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "px-5 py-4 rounded-2xl text-sm relative group shadow-sm transition-all duration-300 backdrop-blur-sm",
                  msg.sender === 'user' 
                    ? "bg-primary text-primary-foreground font-medium rounded-br-sm shadow-primary/20 hover:shadow-primary/30" 
                    : "bg-card border border-border/60 text-foreground rounded-bl-sm hover:border-border"
                )}>
                  {msg.isEncrypted && (
                    <div className={cn(
                      "flex items-center gap-2 mb-3 pb-3 border-b text-[10px] font-bold uppercase tracking-wider",
                      msg.sender === 'user' ? "border-primary-foreground/20 text-primary-foreground/80" : "border-border/60 text-emerald-500"
                    )}>
                      <Lock size={12} /> Verified Stego-Signature
                    </div>
                  )}
                  
                  {msg.image && (
  <div className="mb-4">
    <div className="rounded-lg overflow-hidden border border-border/40 relative group/img bg-black/50">
      <img
        src={msg.image}
        alt="Cover Matrix"
        className="w-full max-h-[240px] object-cover opacity-90 transition-all duration-500 group-hover/img:scale-105 group-hover/img:opacity-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3">
        <span className="text-[10px] font-mono text-emerald-400">
          ENCRYPTED PAYLOAD
        </span>

        <a
          href={msg.image}
          download={`stegvault-${msg.id}.png`}
          className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:scale-105 transition-transform"
        >
          Download
        </a>
      </div>
    </div>
  </div>
)}
                  
                  <p className={cn("leading-relaxed", msg.sender === 'system' && msg.isEncrypted ? 'font-mono text-xs' : 'font-medium')}>
                    {msg.content}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1.5 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.sender === 'user' && <ShieldCheck size={10} className="text-primary ml-1" />}
                </div>
              </motion.div>
            ))}
            
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex gap-2 p-4 rounded-2xl bg-card border border-border/50 w-fit rounded-bl-sm items-center"
                >
                  <Cpu size={14} className="text-primary animate-pulse" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce[animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce[animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-card/40 backdrop-blur-xl border-t border-border/50 shrink-0">
          <div className="max-w-4xl mx-auto relative flex gap-3 sm:gap-4 items-center">
            <Button variant="outline" size="icon" className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-border/50 bg-background/50 hover:bg-secondary hover:text-primary transition-colors shrink-0">
              <FileCode2 size={20} />
            </Button>
            <div className="flex-1 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
              <Input 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Compose secure payload..."
                className="relative h-12 sm:h-14 bg-background/80 border-border/50 rounded-2xl pr-12 pl-5 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all font-medium text-sm w-full"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                <Smile size={18} className="text-muted-foreground/50 hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
            <Button 
              size="icon" 
              onClick={() => void handleSend()}
              disabled={!inputText.trim() || isTyping}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all shrink-0"
            >
              <Send size={18} className={cn("transition-transform", inputText.trim() && !isTyping && "translate-x-0.5 -translate-y-0.5")} />
            </Button>
          </div>
        </div>
      </Card>
      
      {/* RIGHT: TELEMETRY & INSPECTOR (Desktop Only) */}
      <Card className="hidden xl:flex w-80 lg:w-96 bg-card/30 backdrop-blur-2xl border-border/50 rounded-3xl flex-col overflow-hidden shadow-2xl shrink-0">
        <div className="h-20 border-b border-border/50 flex items-center px-6 bg-card/40 shrink-0">
          <Terminal size={18} className="text-primary mr-3" />
          <h3 className="font-bold text-sm tracking-widest text-foreground uppercase">Inspector</h3>
        </div>
        
        <div className="p-6 border-b border-border/30 bg-background/20 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Protocol</span>
            <Badge variant="outline" className="text-[10px] bg-background/50 text-foreground gap-1.5 border-border/50">
              <KeyRound size={10} className="text-primary" /> AES-256
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Embedding</span>
            <Badge variant="outline" className="text-[10px] bg-background/50 text-foreground gap-1.5 border-border/50">
              <ImageIcon size={10} className="text-primary" /> LSB Interleave
            </Badge>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6 min-h-0 bg-black/20 overflow-hidden">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2 shrink-0">
            <Activity size={12} /> Execution Logs
          </h4>
          <div 
            ref={logsScrollRef}
            onScroll={handleLogsScroll}
            className="flex-1 pr-4 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-1.5[&::-webkit-scrollbar-thumb]:bg-border/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80"
          >
            <div className="space-y-3 font-mono text-[11px] leading-relaxed pb-2">
              {logs.map((log) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3"
                >
                  <span className="text-muted-foreground/50 shrink-0">
                    [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' })}]
                  </span>
                  <span className={cn(
                    "break-words",
                    log.level === 'warn' && "text-amber-500",
                    log.level === 'success' && "text-emerald-500",
                    log.level === 'info' && "text-primary/90"
                  )}>
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
    </div>
  );
}