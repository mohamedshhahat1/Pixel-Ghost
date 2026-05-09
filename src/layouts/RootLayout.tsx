import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  ChevronLeft,
  MessageSquare, 
  ChevronRight,
  Settings, 
  Ghost,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useStegoStore } from '@/store/useStegoStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'hide', label: 'Hide Data', icon: Lock },
  { id: 'extract', label: 'Extract Data', icon: Unlock },
  { id: 'deniable', label: 'Deniable Mode', icon: Ghost },
  { id: 'scanner', label: 'Scanner', icon: Search },
  { id: 'chat', label: 'Secure Chat', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function RootLayout({ 
  children, 
  activePage, 
  onPageChange 
}: { 
  children: React.ReactNode; 
  activePage: string;
  onPageChange: (page: string) => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const { theme, setTheme } = useStegoStore();

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  }, [theme]);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    if (!isMobile) setIsMobileNavOpen(false);
  }, [isMobile]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="scanline-overlay flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">

      {/* Mobile Overlay */}
      {isMobile && isMobileNavOpen && (
        <button
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? { x: isMobileNavOpen ? 0 : -280 }
            : { width: isSidebarOpen ? 256 : 80 }
        }
        className="fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border/70 bg-card/60 backdrop-blur-xl lg:relative"
      >
        <div className="p-6 h-20 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0">
              <Ghost className="w-10 h-10 text-primary-foreground" />
            </div>
            {isSidebarOpen && (
              <motion.span
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="
                relative
                text-xl
                sm:text-2xl
                font-extrabold
                tracking-tight
                text-foreground
                transition-all
                duration-300
                hover:scale-105
                cursor-default
              "
            >
              {/* Glow background */}
              <span className="absolute inset-0 blur-2xl opacity-0 hover:opacity-30 bg-primary transition-opacity duration-300" />
            
              {/* Text */}
              <span className="relative z-10">
                Pixel
                <span className="
                  text-primary
                  drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]
                  italic
                  transition-all
                  duration-300
                  hover:tracking-widest
                ">
                  Ghost
                </span>
              </span>
            
              {/* underline glow */}
              <span className="block h-[2px] w-0 hover:w-full transition-all duration-500 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-1 shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                if (isMobile) setIsMobileNavOpen(false);
              }}
              className={cn(
                "flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all",
                activePage === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {(isSidebarOpen || isMobile) && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-16 hidden lg:flex"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 hover:bg-red-500/20 transition">
    <X size={14} className="text-red-400" />
  </div>
) : (
  <div className="w-8 h-8 flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 transition">
    <Menu size={14} className="text-cyan-400" />
  </div>
)}
        </Button>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col relative overflow-hidden">

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Theme Toggle (Always Visible) */}
        <div className="fixed top-6 right-6 z-50">
        <Button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      className={cn(
        // Base container & structural physics
        "group relative flex w-14 h-14 items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-500",
        "hover:scale-105 active:scale-95",
        
        // Accessibility / Keyboard focus (Offset stays matched to app background)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        theme === 'dark' 
          ? "focus-visible:ring-white focus-visible:ring-offset-black" 
          : "focus-visible:ring-black focus-visible:ring-offset-white",
          
        // SWAPPED: Thematic Backgrounds, Borders & Outer Shadows
        theme === 'dark'
          ? "border-black/10 bg-gradient-to-br from-white via-zinc-100 to-zinc-200 shadow-[0_0_20px_rgba(0,0,0,0.15)] hover:border-black/30 hover:shadow-[0_0_30px_rgba(0,0,0,0.25)]"
          : "border-white/20 bg-gradient-to-br from-black via-zinc-900 to-black shadow-[0_0_25px_rgba(255,255,255,0.12)] hover:border-white/40 hover:shadow-[0_0_35px_rgba(255,255,255,0.2)]"
      )}
    >
      {/* 1. Interactive Radial Glow (Swapped) */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          theme === 'dark' 
            ? "bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,transparent_70%)] opacity-40 group-hover:opacity-100"
            : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] opacity-40 group-hover:opacity-100"
        )}
      />

      {/* 2. Inner Border Ring (for 3D depth) (Swapped) */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl border transition-colors duration-500",
          theme === 'dark' 
            ? "border-black/5 group-active:border-black/20"
            : "border-white/10 group-active:border-white/30" 
        )}
      />

      {/* 3. Animated Icon Container */}
      <div className="relative z-10 flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:rotate-12">
        
        {/* Sun Icon (Swapped to Black text) */}
        <Sun
          size={24}
          className={cn(
            "absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            theme === 'dark'
              ? "rotate-0 scale-100 opacity-100 drop-shadow-[0_0_8px_rgba(0,0,0,0.4)] text-black"
              : "rotate-90 scale-50 opacity-0 text-white"
          )}
        />

        {/* Moon Icon (Swapped to White text) */}
        <Moon
          size={24}
          className={cn(
            "absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            theme === 'dark'
              ? "-rotate-90 scale-50 opacity-0 text-black"
              : "rotate-0 scale-100 opacity-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] text-white"
          )}
        />
      </div>

      {/* 4. Enhanced Angled Glass Shine Effect */}
      <div 
        className={cn(
          "absolute inset-0 z-20 pointer-events-none -translate-x-[150%] skew-x-[-30deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out",
          "group-hover:translate-x-[150%]"
        )} 
      />
    </Button>
        </div>

      </main>
    </div>
  );
}