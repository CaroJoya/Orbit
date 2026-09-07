// client/src/pages/Home.tsx - COMPLETE UPDATED FILE

/*
 * Atlas Editorial design reminder for this page:
 * This is a frontend-only product visualization. Treat the route as the protagonist,
 * combine warm travel-journal surfaces with crisp operations UI, and make every
 * simulated state change visible across traveler, operator, and vendor perspectives.
 * No backend calls, real payments, live maps, authentication, or WhatsApp APIs.
 */

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Bike,
  Bot,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CloudRain,
  Compass,
  Copy,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Flag,
  Gauge,
  Headphones,
  Home as HomeIcon,
  Hotel,
  IndianRupee,
  Layers3,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Package,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Route,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Ticket,
  TicketCheck,
  Timer,
  Train,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
  WandSparkles,
  X,
  Zap,
  User,
  UserPlus,
  Baby,
  Clock,
  CheckCheck,
  Loader2,
  QrCode,
  Workflow,
  GitBranch,
  GitCommit,
  GitMerge,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  PhoneCall,
  Video,
  Paperclip,
  Mic,
  Smile,
  MoreVertical,
  Wifi,
  Coffee,
  Utensils,
  Dumbbell,
  Wind,
  Sun,
  Moon,
  Trees,
  Waves,
  Mountain,
  Flower,
  Sparkle,
  Crown,
  Gem,
  Shield,
  Users,
  Briefcase,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { RouteRadarMap, POI, generatePOIsForRoute, resolveDestinationCoordinates } from "@/components/RouteRadarMap";
import { Logo } from "@/components/Logo";
import { format } from "date-fns";

type Mode = "traveler" | "operator" | "vendor";
type TravelerStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// =============================================================================
// INTERFACES
// =============================================================================

interface VendorConfirmation {
  id: string;
  name: string;
  type: 'hotel' | 'driver' | 'guide' | 'activity' | 'vendor';
  icon: React.ElementType;
  status: 'pending' | 'confirming' | 'confirmed' | 'declined';
  responseTime?: string;
  price?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

interface PaymentConfirmation {
  method: string;
  timestamp: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface RoutePlan {
  destination: string;
  origin: string;
  localStop: string;
  scenicStop: string;
  hotel: string;
  distance: string;
  driveTime: string;
}

type PickupMode = "home" | "hotel" | "custom";
type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

// =============================================================================
// CONSTANTS
// =============================================================================

const imageReference = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85";
const mapImage = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=85";
const stopImage = "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85";

const BASE_TRIP_PRICE = 47800;
const LOCAL_STOP_PRICE = 240;

// Destination images mapping
const destinationImages: Record<string, string> = {
  goa: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85",
  jaipur: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85",
  kerala: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=1600&q=85",
  manali: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=85",
  udaipur: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1600&q=85",
  varanasi: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=1600&q=85",
  delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=85",
  mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1600&q=85",
  chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=85",
  bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=85",
  pushkar: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1600&q=85",
  jodhpur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=85",
  amritsar: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1600&q=85",
  default: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85",
};

function getDestinationImage(destination: string): string {
  const clean = destination.trim().toLowerCase();
  if (destinationImages[clean]) return destinationImages[clean];
  const match = Object.keys(destinationImages).find(
    (key) => clean.includes(key) || key.includes(clean)
  );
  return match ? destinationImages[match] : destinationImages.default;
}

function createRoutePlan(destination: string): RoutePlan {
  const cleanDestination = destination.trim() || "Your destination";
  const origin = cleanDestination.split(',')[0].trim();
  return {
    destination: cleanDestination,
    origin,
    localStop: `${origin} local market`,
    scenicStop: `${origin} viewpoint`,
    hotel: `${origin} heritage stay`,
    distance: origin === "Jaipur" ? "184 km" : "route preview",
    driveTime: origin === "Jaipur" ? "4h 20m driving" : "buffer-aware drive",
  };
}

const journey = [
  { label: "Intake Canvas", short: "01" },
  { label: "Route Radar", short: "02" },
  { label: "Customize", short: "03" },
  { label: "Checkout", short: "04" },
  { label: "Digital Pass", short: "05" },
  { label: "Adapt Day", short: "06" },
  { label: "Complete", short: "07" },
];

const navItems = [
  { label: "Intake Canvas", icon: WandSparkles, step: 0 },
  { label: "Route Radar", icon: Navigation, step: 1 },
  { label: "Customize", icon: Layers3, step: 2 },
  { label: "Checkout", icon: CreditCard, step: 3 },
  { label: "Digital Pass", icon: TicketCheck, step: 4 },
  { label: "Ripple Engine", icon: Zap, step: 5 },
];

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

function MiniLabel({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "teal" | "amber" | "saffron" | "coral" | "green" }) {
  return (
    <span className={cn("eyebrow", tone === "teal" && "text-teal", tone === "amber" && "text-amber", tone === "saffron" && "text-saffron", tone === "coral" && "text-coral", tone === "green" && "text-moss")}>
      {children}
    </span>
  );
}

function StatusChip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "coral" | "teal" }) {
  return <span className={cn("status-chip", `status-${tone}`)}><span className="status-dot" />{children}</span>;
}

function Metric({ label, value, sub, icon: Icon, tone = "teal" }: { label: string; value: string; sub: string; icon: React.ElementType; tone?: string }) {
  return (
    <Card className="metric-card">
      <div className={cn("metric-icon", `metric-${tone}`)}><Icon size={16} strokeWidth={2.2} /></div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">{label}</p>
        <p className="mt-1 font-display text-[26px] font-semibold leading-none tracking-tighter text-ink">{value}</p>
        <p className="mt-2 text-xs text-ink-muted">{sub}</p>
      </div>
    </Card>
  );
}

function PriceBar({ total, delta }: { total: string; delta?: string }) {
  return (
    <div className="sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-[18px] bg-ink px-5 py-4 text-paper shadow-[0_14px_40px_rgba(23,34,35,0.22)] sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/20 text-teal-light"><IndianRupee size={17} /></div>
        <div><p className="eyebrow text-paper/45">Live trip total</p><p className="mt-1 text-sm text-paper/72">Every choice stays transparent</p></div>
      </div>
      <div className="flex items-end gap-3 text-right"><div><p className="text-2xl font-bold tracking-tighter">{total}</p>{delta && <p className="text-xs font-semibold text-teal-light">{delta}</p>}</div><ArrowDownRight size={17} className="mb-1 text-teal-light" /></div>
    </div>
  );
}

function TravelerCounter({ 
  label, 
  value, 
  onIncrement, 
  onDecrement, 
  icon: Icon,
  min = 0
}: { 
  label: string; 
  value: number; 
  onIncrement: () => void; 
  onDecrement: () => void;
  icon: React.ElementType;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-ink-muted" />
        <span className="text-sm font-medium text-ink">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          disabled={value <= min}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
            value <= min 
              ? "border-ink/10 text-ink-muted/40 cursor-not-allowed" 
              : "border-ink/20 text-ink hover:bg-ink/5"
          )}
        >
          <span className="text-lg leading-none">−</span>
        </button>
        <span className="w-6 text-center text-sm font-semibold text-ink">{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink/20 text-ink hover:bg-ink/5 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
        </button>
      </div>
    </div>
  );
}

function Sidebar({ step, setStep }: { step: TravelerStep; setStep: (step: TravelerStep) => void }) {
  const [, setLocation] = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-63 flex-col bg-ink px-5 py-6 text-paper lg:flex">
      <div className="flex items-center gap-3 px-2">
        <Logo inverse />
      </div>

      <div className="mt-14 px-2">
        <p className="eyebrow text-paper/38">Demo journey</p>
        <p className="mt-3 text-sm leading-6 text-paper/64">One connected trip from first idea to live adaptation.</p>
      </div>

      <nav className="mt-8 space-y-1.5" aria-label="Demo stages">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const active = step === item.step;
          const complete = step > item.step;
          return (
            <button key={item.label} type="button" onClick={() => setStep(item.step as TravelerStep)} className={cn("nav-item", active && "nav-item-active")}>
              <span className={cn("nav-number", active && "nav-number-active", complete && "nav-number-complete")}>{complete ? <Check size={13} /> : item.step + 1}</span>
              <Icon size={16} className={cn("transition-colors", active ? "text-teal-light" : "text-paper/40")} />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-teal-light" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-paper/10 pt-7">
        <p className="eyebrow px-2 text-paper/38">Workspace</p>
        <button type="button" onClick={() => setLocation("/trips")} className="workspace-link"><Navigation size={15} />Trip shelf</button>
        <button type="button" onClick={() => setLocation("/explore")} className="workspace-link"><Compass size={15} />Explore routes</button>
        <button type="button" onClick={() => setLocation("/guide")} className="workspace-link"><FileCheck2 size={15} />Field guide</button>
      </div>

      <div className="mt-auto rounded-[20px] border border-paper/10 bg-paper/6 p-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow text-paper/42">Story mode</span>
          <Sparkles size={15} className="text-saffron-light" />
        </div>
        <p className="mt-3 text-sm font-semibold text-paper">Frontend only</p>
        <p className="mt-1 text-xs leading-5 text-paper/48">All states are simulated for a clear visual demo.</p>
      </div>
    </aside>
  );
}

function ProgressRail({ step }: { step: TravelerStep }) {
  return (
    <div className="mb-8 flex items-center gap-0 overflow-x-auto pb-1 lg:mb-10">
      {journey.map((item, index) => {
        const active = step === index;
        const done = step > index;
        return (
          <div key={item.label} className="flex min-w-24 items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={cn("journey-dot", active && "journey-dot-active", done && "journey-dot-done")}>
                {done ? <Check size={13} /> : item.short}
              </div>
              <span className={cn("whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em]", active ? "text-teal" : done ? "text-ink/58" : "text-ink-muted/75")}>{item.label}</span>
            </div>
            {index < journey.length - 1 && <div className={cn("journey-line", done && "journey-line-done")} />}
          </div>
        );
      })}
    </div>
  );
}

function AppHeader({ mode, setMode, onRestart, destination }: { mode: Mode; setMode: (mode: Mode) => void; onRestart: () => void; destination: string }) {
  const [, setLocation] = useLocation();
  return (
    <header className="sticky top-0 z-40 flex h-19 items-center justify-between border-b border-ink/10 bg-paper/90 px-6 backdrop-blur-xl lg:px-9">
      <div className="flex items-center gap-3">
        <Logo className="cursor-pointer" onClick={() => setLocation("/")} />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="mode-switch" role="tablist" aria-label="Demo perspective">
          {(["traveler", "operator", "vendor"] as Mode[]).map((item) => (
            <button key={item} type="button" className={cn("mode-tab", mode === item && "mode-tab-active")} onClick={() => setMode(item)}>
              {item === "traveler" ? <UserRound size={14} /> : item === "operator" ? <BriefcaseBusiness size={14} /> : <MessageCircle size={14} />}
              <span className="hidden sm:inline">{item}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onRestart} className="icon-button" aria-label="Restart demo"><RefreshCw size={16} /></button>
        <button type="button" onClick={() => setLocation("/activity")} className="icon-button relative" aria-label="Notifications"><Bell size={16} /><span className="notification-dot" /></button>
        <button type="button" onClick={() => setLocation("/account")} className="hidden h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper transition-transform hover:scale-[1.03] sm:flex" aria-label="Open profile">AS</button>
      </div>
    </header>
  );
}

// =============================================================================
// DESTINATION AUTOCOMPLETE HOOK
// =============================================================================

function useDestinationAutocomplete() {
  const [suggestions, setSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&featuretype=city&featuretype=town&featuretype=village`
        );
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { suggestions, loading, showSuggestions, search, clearSuggestions, setShowSuggestions };
}

// =============================================================================
// PAYMENT COMPONENTS
// =============================================================================

function PaymentMethodSelection({
  selectedMethod,
  onSelect,
  onPay,
  isProcessing,
  grandTotal,
}: {
  selectedMethod: string | null;
  onSelect: (methodId: string) => void;
  onPay: () => void;
  isProcessing: boolean;
  grandTotal: number;
}) {
  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'card', 
      name: 'Credit / Debit Card', 
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay accepted'
    },
    { 
      id: 'upi', 
      name: 'UPI', 
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm'
    },
    { 
      id: 'netbanking', 
      name: 'Net Banking', 
      icon: WalletCards,
      description: 'All major banks'
    },
    { 
      id: 'wallet', 
      name: 'Wallet', 
      icon: WalletCards,
      description: 'Paytm, Amazon Pay, Ola Money'
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="field-label">Select Payment Method</p>
        <span className="text-xs font-bold text-teal">Secure</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200",
                isSelected 
                  ? "border-teal/40 bg-teal/5 shadow-[0_0_0_4px_rgba(13,148,136,0.1)]" 
                  : "border-ink/10 hover:border-teal/20",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              disabled={isProcessing}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isSelected ? "bg-teal/10 text-teal" : "bg-ink/5 text-ink-muted"
              )}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink">{method.name}</p>
                <p className="text-[10px] text-ink-muted">{method.description}</p>
              </div>
              {isSelected && (
                <CheckCircle2 size={16} className="text-teal shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      
      <Button
        onClick={onPay}
        disabled={!selectedMethod || isProcessing}
        className={cn(
          "mt-2 h-12 w-full rounded-xl font-bold text-white transition-all",
          selectedMethod && !isProcessing
            ? "bg-teal hover:bg-teal-dark shadow-[0_8px_24px_rgba(13,148,136,0.2)]"
            : "bg-ink/20 text-ink-muted/50 cursor-not-allowed"
        )}
      >
        {isProcessing ? (
          <><Loader2 size={18} className="mr-2 animate-spin" /> Processing Payment...</>
        ) : (
          <><CreditCard size={18} className="mr-2" /> Pay ₹{grandTotal.toLocaleString("en-IN")}</>
        )}
      </Button>
      
      <p className="text-center text-[10px] text-ink-muted/60 flex items-center justify-center gap-1">
        <LockKeyhole size={12} />
        Secure payment · No card details stored
      </p>
    </div>
  );
}

function PaymentConfirmationScreen({
  confirmation,
  onComplete,
}: {
  confirmation: PaymentConfirmation;
  onComplete: () => void;
}) {
  const [showReceipt, setShowReceipt] = useState(false);
  
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-moss/10 text-moss">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tighter">Payment Successful!</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Your trip is confirmed. Transaction ID: {confirmation.transactionId}
        </p>
      </div>
      
      <Card className="p-5 border-moss/20 bg-moss/5">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Amount Paid</span>
            <span className="font-bold text-ink">₹{confirmation.amount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Payment Method</span>
            <span className="font-semibold text-ink capitalize">{confirmation.method}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Transaction ID</span>
            <span className="font-mono text-xs text-ink">{confirmation.transactionId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Date & Time</span>
            <span className="text-ink">{format(new Date(confirmation.timestamp), "dd MMM yyyy, hh:mm a")}</span>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => setShowReceipt(!showReceipt)}
          variant="outline"
          className="flex-1 h-11 rounded-xl border-ink/12 font-bold text-ink hover:bg-paper-dark"
        >
          <FileText size={16} className="mr-2" />
          {showReceipt ? "Hide Receipt" : "View Receipt"}
        </Button>
        <Button
  onClick={() => {
    // Create receipt data
    const receiptData = `
ORBIT TRIP CONFIRMATION
========================
Booking: ${confirmation.transactionId}
Date: ${format(new Date(confirmation.timestamp), "dd MMM yyyy, hh:mm a")}
Amount: ₹${confirmation.amount.toLocaleString("en-IN")}
Payment: ${confirmation.method}
Status: ${confirmation.status}

Trip Details:
- Destination: Jaipur, Rajasthan
- Dates: 12-14 Feb 2026
- Traveler: Aanya Sharma

Thank you for choosing Orbit! 🌏
    `.trim();

    // Create and download file
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${confirmation.transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Receipt downloaded!");
  }}
  className="flex-1 h-11 rounded-xl bg-teal font-bold text-white hover:bg-teal-dark"
>
  <Download size={16} className="mr-2" />
  Download Confirmation
</Button>
      </div>
      
      {showReceipt && (
        <Card className="p-5 border-ink/8 animate-fade-up">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-muted">Booking Reference</span>
              <span className="font-mono font-bold">{confirmation.transactionId.slice(0, 12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Status</span>
              <span className="text-moss font-bold">✓ Confirmed</span>
            </div>
            <div className="border-t border-ink/8 pt-2">
              <p className="text-center text-ink-muted/60">Thank you for choosing Orbit. Safe travels! 🌏</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// =============================================================================
// CHECKOUT COMPONENT WITH PAYMENT INTEGRATION
// =============================================================================

function Checkout({ 
  addedStop, 
  upgraded, 
  onNext,
  vendors,
  onConfirmVendor,
  onConfirmAll,
  isConfirmingAll,
  arrivalTime,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  onPay,
  isProcessingPayment,
  paymentConfirmation,
  showPaymentConfirmation,
  setVendors,
}: { 
  addedStop: boolean; 
  upgraded: boolean; 
  onNext: () => void;
  vendors: VendorConfirmation[];
  onConfirmVendor: (id: string) => void;
  onConfirmAll: () => void;
  isConfirmingAll: boolean;
  arrivalTime?: string;
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (method: string) => void;
  onPay: () => void;
  isProcessingPayment: boolean;
  paymentConfirmation: PaymentConfirmation | null;
  showPaymentConfirmation: boolean;
  setVendors: React.Dispatch<React.SetStateAction<VendorConfirmation[]>>;
}) {
  const checks = ["Travel distance within daily limit", "Activity timing compatible with route", "Hotel check-in time achievable", "Driver rest buffer preserved", "Vendor availability confirmed"];
  const hotelsPrice = upgraded ? 14200 : 13000;
  const transportPrice = 18400;
  const activitiesPrice = 12400;
  const servicePrice = 4000;
  const localStopPrice = addedStop ? 240 : 0;
  const grandTotal = hotelsPrice + transportPrice + activitiesPrice + servicePrice + localStopPrice;
  
  const allVendorsConfirmed = vendors.every(v => v.status === 'confirmed');
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null);
  
  const handleRemoveVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    setShowRemoveConfirm(null);
    toast.success("Vendor removed from trip");
  };
  
  if (showPaymentConfirmation && paymentConfirmation) {
    return (
      <div className="space-y-8 animate-fade-up">
        <div className="section-heading">
          <MiniLabel tone="teal">04 / Payment Confirmation</MiniLabel>
          <h1>Payment <em>completed.</em></h1>
          <p>Your trip is now confirmed. You'll receive a detailed itinerary shortly.</p>
        </div>
        <PaymentConfirmationScreen 
          confirmation={paymentConfirmation}
          onComplete={onNext}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="section-heading">
        <MiniLabel tone="teal">04 / Checkout</MiniLabel>
        <h1>Everything aligned. <em>One calm checkout.</em></h1>
        <p>A single view of every commitment before the route becomes real.</p>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-ink/8 pb-5">
              <div>
                <p className="eyebrow text-ink-muted">Feasibility check</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">The route is holding.</h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss/10 text-moss">
                <CheckCircle2 size={23} />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              {checks.map((check, index) => (
                <div key={check} className="flex items-center gap-3 rounded-xl bg-paper-dark px-4 py-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss">
                    <Check size={13} />
                  </span>
                  <span className="text-sm text-ink/78">{check}</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-moss">Passed</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-ink/8 pb-5">
              <div>
                <p className="eyebrow text-ink-muted">Vendor Confirmations</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {allVendorsConfirmed ? "All vendors confirmed ✓" : `${pendingVendors.length} vendor${pendingVendors.length > 1 ? 's' : ''} pending`}
                </p>
              </div>
              <div className="flex gap-2">
                {!allVendorsConfirmed && pendingVendors.length > 0 && (
                  <Button
                    onClick={onConfirmAll}
                    disabled={isConfirmingAll}
                    size="sm"
                    className="h-8 rounded-lg bg-teal text-xs font-bold text-white hover:bg-teal-dark"
                  >
                    {isConfirmingAll ? (
                      <><Loader2 size={14} className="mr-1.5 animate-spin" /> Confirming...</>
                    ) : (
                      <>Confirm All</>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-5 space-y-2">
              {vendors.map((vendor) => {
                const Icon = vendor.icon;
                const isConfirmed = vendor.status === 'confirmed';
                const isPending = vendor.status === 'pending';
                const isConfirming = vendor.status === 'confirming';
                const isDeclined = vendor.status === 'declined';
                const showRemove = showRemoveConfirm === vendor.id;
                
                return (
                  <div 
                    key={vendor.id} 
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
                      isConfirmed ? "border-moss/20 bg-moss/5" : "border-ink/8 bg-paper-dark/50",
                      isConfirming && "border-amber/20 bg-amber/5"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      isConfirmed ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink-muted"
                    )}>
                      <Icon size={15} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink">{vendor.name}</p>
                      <p className="text-[10px] text-ink-muted capitalize">{vendor.type}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {vendor.price && (
                        <span className="text-xs font-semibold text-ink">₹{vendor.price}</span>
                      )}
                      
                      {isConfirmed ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-moss">
                          <CheckCircle2 size={14} /> Confirmed
                        </span>
                      ) : isConfirming ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber">
                          <Loader2 size={14} className="animate-spin" /> Confirming...
                        </span>
                      ) : isDeclined ? (
                        <span className="text-xs font-bold text-coral">Declined</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => onConfirmVendor(vendor.id)}
                            size="sm"
                            variant="outline"
                            className="h-7 rounded-lg border-teal/30 px-3 text-xs font-bold text-teal hover:bg-teal/5"
                          >
                            Confirm
                          </Button>
                          {showRemove ? (
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => handleRemoveVendor(vendor.id)}
                                size="sm"
                                variant="destructive"
                                className="h-7 rounded-lg px-2 text-xs font-bold"
                              >
                                Remove
                              </Button>
                              <Button
                                onClick={() => setShowRemoveConfirm(null)}
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-lg px-2 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowRemoveConfirm(vendor.id)}
                              className="text-ink-muted/40 hover:text-coral transition-colors"
                              aria-label={`Remove ${vendor.name}`}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {allVendorsConfirmed && (
              <div className="mt-4 rounded-xl bg-moss/10 p-3 text-center text-xs font-bold text-moss animate-fade-up">
                <CheckCircle2 size={16} className="inline mr-2" />
                All vendors confirmed! Your trip is ready for payment.
              </div>
            )}
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-ink/8 pb-5">
              <div>
                <p className="eyebrow text-ink-muted">Timing Compatibility</p>
              </div>
              <Badge className={cn(
                allVendorsConfirmed ? "bg-moss/10 text-moss" : "bg-amber/10 text-amber"
              )}>
                {allVendorsConfirmed ? "✓ All Checks Passed" : "⏳ Pending"}
              </Badge>
            </div>
            
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Hotel Check-in</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{arrivalTime || "17:30"}</span>
                  <span className={cn(
                    "text-xs font-bold",
                    allVendorsConfirmed ? "text-moss" : "text-amber"
                  )}>
                    {allVendorsConfirmed ? "✓ Achievable" : "⏳ Pending"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Arrival Buffer</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">45 min</span>
                  <span className="text-xs font-bold text-moss">✓ Preserved</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Driver Rest</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">2.5 hours</span>
                  <span className="text-xs font-bold text-moss">✓ Protected</span>
                </div>
              </div>
            </div>
            
            {allVendorsConfirmed && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2 text-xs text-teal animate-fade-up">
                <Clock size={14} />
                All timing checks passed. Route is feasible.
              </div>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="h-fit p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-ink-muted">Trip ledger</p>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-moss">
                <LockKeyhole size={13} /> Secure demo
              </span>
            </div>
            
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Hotels · 2 nights</span>
                <strong>₹{hotelsPrice.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Transport · 3 days</span>
                <strong>₹{transportPrice.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Activities & guide</span>
                <strong>₹{activitiesPrice.toLocaleString("en-IN")}</strong>
              </div>
              {addedStop && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Local stop voucher</span>
                  <strong>₹{localStopPrice.toLocaleString("en-IN")}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-muted">Orbit service</span>
                <strong>₹{servicePrice.toLocaleString("en-IN")}</strong>
              </div>
            </div>
            
            <div className="my-5 border-t border-ink/8" />
            
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-ink">Trip total</span>
              <span className="font-display text-3xl font-semibold tracking-tighter text-ink">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
            
            {allVendorsConfirmed ? (
              <div className="mt-4">
                <PaymentMethodSelection
                  selectedMethod={selectedPaymentMethod}
                  onSelect={onSelectPaymentMethod}
                  onPay={onPay}
                  isProcessing={isProcessingPayment}
                  grandTotal={grandTotal}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-amber/10 p-4 text-center">
                <p className="text-xs font-bold text-amber">⚠️ Please confirm all vendors before proceeding to payment.</p>
                <p className="mt-1 text-[10px] text-ink-muted">{pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} pending confirmation</p>
              </div>
            )}
            
            <p className="mt-3 text-center text-[11px] leading-5 text-ink-muted">
              Demo interaction only · no payment is processed
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// INTAKE CANVAS COMPONENT
// =============================================================================

function IntakeCanvas({
  destination,
  setDestination,
  routePlan,
  budget,
  setBudget,
  dates,
  setDates,
  durationDays,
  setDurationDays,
  pickupMode,
  setPickupMode,
  pickupAddress,
  setPickupAddress,
  styles,
  setStyles,
  adults,
  setAdults,
  childrenCount,
  setChildrenCount,
  infants,
  setInfants,
  onBuild,
  onDestinationClick,
}: {
  destination: string;
  setDestination: (value: string) => void;
  routePlan: RoutePlan;
  budget: number[];
  setBudget: (value: number[]) => void;
  dates: string;
  setDates: (value: string) => void;
  durationDays: number;
  setDurationDays: (value: number) => void;
  pickupMode: PickupMode;
  setPickupMode: (value: PickupMode) => void;
  pickupAddress: string;
  setPickupAddress: (value: string) => void;
  styles: string[];
  setStyles: (value: string[]) => void;
  adults: number;
  setAdults: (value: number) => void;
  childrenCount: number;
  setChildrenCount: (value: number) => void;
  infants: number;
  setInfants: (value: number) => void;
  onBuild: () => void;
  onDestinationClick?: (destination: string) => void;
}) {
  const toggleStyle = (label: string) => setStyles(styles.includes(label) ? styles.filter((item) => item !== label) : [...styles, label]);
  const nights = Math.max(durationDays - 1, 0);
  const { suggestions, loading, showSuggestions, search, clearSuggestions, setShowSuggestions } = useDestinationAutocomplete();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    search(value);
  };

  const handleSuggestionSelect = (suggestion: { display_name: string; lat: string; lon: string }) => {
    setDestination(suggestion.display_name);
    clearSuggestions();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setDates(format(date, "dd MMM yyyy"));
      setCalendarOpen(false);
    }
  };

  const totalTravelers = adults + childrenCount + infants;
  const destinationImage = getDestinationImage(destination);

  const styleCards = [
    { label: "Local Street Food", icon: Store, color: "bg-saffron/12 text-saffron" },
    { label: "Scenic Drives", icon: Route, color: "bg-teal/12 text-teal" },
    { label: "Culture & History", icon: MapPin, color: "bg-ink/8 text-ink" },
    { label: "Thrill", icon: Bike, color: "bg-coral/12 text-coral" },
    { label: "Relaxed", icon: Coffee, color: "bg-moss/12 text-moss" },
    { label: "Adventure", icon: Mountain, color: "bg-amber/20 text-amber-dark" },
    { label: "Family Friendly", icon: UsersRound, color: "bg-teal/8 text-teal" },
    { label: "Romantic Getaway", icon: Heart, color: "bg-coral/8 text-coral" },
    { label: "Budget Travel", icon: WalletCards, color: "bg-moss/8 text-moss" },
    { label: "Luxury", icon: Sparkles, color: "bg-saffron/8 text-saffron" },
    { label: "Spiritual", icon: Compass, color: "bg-ink/6 text-ink" },
  ];

  const travelServices = [
    { id: "flights", label: "Flights", icon: Plane, color: "text-teal" },
    { id: "hotels", label: "Hotels", icon: Hotel, color: "text-saffron" },
    { id: "homestays", label: "Homestays & Villas", icon: HomeIcon, color: "text-moss" },
    { id: "packages", label: "Holiday Packages", icon: Package, color: "text-coral" },
    { id: "trains", label: "Trains", icon: Train, color: "text-amber" },
    { id: "buses", label: "Buses", icon: Bus, color: "text-teal" },
    { id: "cabs", label: "Cabs", icon: Car, color: "text-saffron" },
    { id: "tours", label: "Tours & Attractions", icon: Ticket, color: "text-moss" },
  ];

  const suggestedDestinations = [
    {
      id: "goa",
      name: "Goa",
      location: "India",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      description: "Beaches, nightlife & Portuguese heritage",
      rating: "4.8",
      price: "From ₹8,999",
    },
    {
      id: "jaipur",
      name: "Jaipur",
      location: "Rajasthan, India",
      image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
      description: "The Pink City · Palaces & Forts",
      rating: "4.7",
      price: "From ₹6,499",
    },
    {
      id: "kerala",
      name: "Kerala",
      location: "India",
      image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80",
      description: "Backwaters, houseboats & tropical greenery",
      rating: "4.9",
      price: "From ₹12,999",
    },
    {
      id: "manali",
      name: "Manali",
      location: "Himachal Pradesh, India",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      description: "Himalayan mountains & adventure sports",
      rating: "4.6",
      price: "From ₹7,499",
    },
    {
      id: "udaipur",
      name: "Udaipur",
      location: "Rajasthan, India",
      image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
      description: "Lakes, palaces & romantic ambiance",
      rating: "4.8",
      price: "From ₹8,999",
    },
    {
      id: "varanasi",
      name: "Varanasi",
      location: "Uttar Pradesh, India",
      image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80",
      description: "Spiritual ghats & ancient culture",
      rating: "4.5",
      price: "From ₹5,499",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div>
          <MiniLabel tone="teal">Explore</MiniLabel>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tighter text-ink">Plan your journey</h3>
        </div>
        <span className="text-xs text-ink-muted">8 services</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {travelServices.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                toast.info(`${service.label} service opened`);
              }}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-ink/8 bg-paper/60 p-4 transition-all duration-200 hover:border-teal/30 hover:bg-paper hover:shadow-[0_8px_24px_rgba(13,148,136,0.08)] hover:-translate-y-0.5"
            >
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200",
                "bg-ink/5 group-hover:bg-teal/10 group-hover:scale-105",
                service.color
              )}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-semibold text-ink/80 text-center leading-tight group-hover:text-ink">
                {service.label}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <MiniLabel tone="saffron">Trending Destinations</MiniLabel>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-tighter text-ink">Popular places to visit</h3>
        </div>
        <button 
          type="button" 
          onClick={() => toast.info("View all destinations")}
          className="text-xs font-bold text-teal hover:underline flex items-center gap-1"
        >
          See all <ArrowRight size={13} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {suggestedDestinations.map((destination) => (
          <button
            key={destination.id}
            type="button"
            onClick={() => {
              onDestinationClick?.(destination.name);
              toast.info(`Exploring ${destination.name}`);
            }}
            className="group relative overflow-hidden rounded-2xl aspect-4/3 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-teal"
          >
            <img 
              src={destination.image} 
              alt={destination.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/30 to-transparent" />
            
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/70 backdrop-blur-sm px-2.5 py-1">
              <Star size={10} className="fill-saffron text-saffron" />
              <span className="text-[10px] font-bold text-white">{destination.rating}</span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
              <h4 className="text-sm font-bold text-white leading-tight">{destination.name}</h4>
              <p className="mt-0.5 text-[10px] text-white/75 leading-tight">{destination.location}</p>
              <p className="mt-0.5 text-[9px] text-white/60 leading-tight line-clamp-1">{destination.description}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-teal-light">{destination.price}</span>
                <span className="text-[9px] text-white/40">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="section-heading max-w-3xl"><MiniLabel tone="teal">01 / Intake Canvas</MiniLabel><h1>Build a trip that can <em>bend</em> without breaking.</h1><p>Tell Orbit how you want to move. The route, stays, local stops, and live operations will shape around you.</p></div>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="form-card">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow text-ink-muted">Trip brief</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">Where should the route begin?</h2></div><div className="rounded-xl bg-teal/10 px-3 py-2 text-xs font-bold text-teal">Draft 01</div></div>
          <div className="mt-8 space-y-6">
            <div>
              <label className="field-label">Destination</label>
              <div className="relative">
                <div className="field-shell">
                  <MapPin size={17} className="text-teal" />
                  <input 
                    value={destination} 
                    onChange={handleDestinationChange}
                    onFocus={() => destination.length >= 2 && setShowSuggestions(true)}
                    placeholder="e.g. Jaipur, Rajasthan" 
                    aria-label="Destination" 
                  />
                  {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-ink/10 bg-paper shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-teal/5 transition-colors border-b border-ink/5 last:border-b-0"
                      >
                        {suggestion.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Dates</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button className="field-shell w-full text-left">
                      <CalendarDays size={17} className="text-ink-muted" />
                      <span className={cn("flex-1", !dates && "text-ink-muted/60")}>
                        {dates || "Select dates"}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <label className="field-label">Duration<div className="field-shell"><Timer size={17} className="text-ink-muted" /><select value={durationDays} onChange={(event) => setDurationDays(Number(event.target.value))} aria-label="Duration" className="w-full bg-transparent text-sm text-ink outline-none">{Array.from({ length: 7 }, (_, index) => index + 1).map((day) => <option key={day} value={day}>{day} day{day > 1 ? "s" : ""} · {Math.max(day - 1, 0)} night{Math.max(day - 1, 0) !== 1 ? "s" : ""}</option>)}</select></div></label>
            </div>
            
            <div>
              <label className="field-label mb-3">Travelers</label>
              <Card className="p-4 border-ink/10">
                <TravelerCounter 
                  label="Adults" 
                  value={adults} 
                  onIncrement={() => setAdults(adults + 1)} 
                  onDecrement={() => setAdults(adults - 1)} 
                  icon={User}
                  min={1}
                />
                <TravelerCounter 
                  label="Children (5-12)" 
                  value={childrenCount} 
                  onIncrement={() => setChildrenCount(childrenCount + 1)} 
                  onDecrement={() => setChildrenCount(childrenCount - 1)} 
                  icon={UserPlus}
                />
                <TravelerCounter 
                  label="Infants (0-4)" 
                  value={infants} 
                  onIncrement={() => setInfants(infants + 1)} 
                  onDecrement={() => setInfants(infants - 1)} 
                  icon={Baby}
                />
                <div className="mt-2 pt-2 border-t border-ink/8 flex justify-between text-sm">
                  <span className="text-ink-muted">Total travelers</span>
                  <span className="font-semibold text-ink">{totalTravelers}</span>
                </div>
              </Card>
            </div>

            <div><div className="mb-3 flex items-center justify-between"><label className="field-label">Spending limit</label><span className="font-display text-lg font-semibold text-ink">₹{budget[0].toLocaleString("en-IN")}</span></div>
              <Slider 
                value={budget} 
                onValueChange={(value) => {
                  const newValue = value[0] === 0 ? 1000 : value[0];
                  setBudget([newValue]);
                }} 
                min={0} 
                max={200000} 
                step={1000} 
              />
              <div className="mt-2 flex justify-between text-[11px] text-ink-muted">
                <span>₹0</span>
                <span className="text-teal text-xs font-medium">Min: ₹1,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>
            <div>
              <p className="field-label mb-3">Pickup origin</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "home" as const, label: "Pick up at Home", icon: HomeIcon, copy: "Road trip" }, { id: "hotel" as const, label: "Hotel / Airport", icon: Hotel, copy: "Destination tour" }].map((item) => {
                  const Icon = item.icon;
                  return <button key={item.id} type="button" onClick={() => setPickupMode(item.id)} className={cn("choice-card", pickupMode === item.id && "choice-card-active")}><Icon size={18} /><span><strong>{item.label}</strong><small>{item.copy}</small></span>{pickupMode === item.id && <CheckCircle2 size={16} className="ml-auto text-teal" />}</button>;
                })}
              </div>
              <div className="field-shell mt-3">
                <MapPin size={17} className={cn(pickupMode === "custom" ? "text-teal" : "text-ink-muted")} />
                <input
                  value={pickupAddress}
                  onChange={(event) => { setPickupAddress(event.target.value); setPickupMode("custom"); }}
                  onFocus={() => pickupAddress && setPickupMode("custom")}
                  placeholder="Or type a specific pickup address"
                  aria-label="Custom pickup address"
                />
              </div>
            </div>
            <div><p className="field-label mb-3">Travel mood <span className="font-normal normal-case tracking-normal text-ink-muted">Select all that fit</span></p><div className="flex flex-wrap gap-2">{styleCards.map((item) => { const Icon = item.icon; const selected = styles.includes(item.label); return <button type="button" key={item.label} onClick={() => toggleStyle(item.label)} className={cn("style-chip", selected && "style-chip-selected")}><span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", item.color)}><Icon size={14} /></span>{item.label}{selected && <Check size={13} className="text-teal" />}</button>; })}</div></div>
            <Button onClick={onBuild} className="group h-12 w-full rounded-xl bg-teal text-base font-bold text-white shadow-[0_8px_22px_rgba(13,148,136,0.18)] hover:bg-teal-dark">Build my trip <ArrowRight size={17} className="ml-2 transition-transform group-hover:translate-x-1" /></Button>
          </div>
        </Card>
        <div className="relative min-h-130 overflow-hidden rounded-[28px] xl:mt-8 bg-ink shadow-[0_18px_50px_rgba(23,34,35,0.15)]">
          <img src={destinationImage} alt={`Road toward ${routePlan.origin}`} className="absolute inset-0 h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-6 text-paper sm:p-8"><div className="flex items-center justify-between"><span className="rounded-full border border-paper/18 bg-ink/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">Route dossier · {routePlan.destination}</span><span className="flex items-center gap-2 rounded-full bg-paper/12 px-3 py-2 text-xs font-semibold backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-teal-light" /> Season-aware</span></div><div><div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron text-ink"><Compass size={19} /></div><span className="text-sm font-medium text-paper/75">Your route will consider weather, buffers, and local character.</span></div><h2 className="max-w-md font-display text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-5xl">A slower road to the <em className="text-saffron-light">good stuff.</em></h2><div className="mt-8 grid max-w-md grid-cols-3 gap-2 border-t border-paper/18 pt-5"><div><p className="text-2xl font-semibold">{durationDays}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-paper/52">Days</p></div><div><p className="text-2xl font-semibold">{nights}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-paper/52">Nights</p></div><div><p className="text-2xl font-semibold">{totalTravelers}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-paper/52">Travelers</p></div></div></div></div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ENHANCED CUSTOMIZE COMPONENT
// =============================================================================

type PackageTier = 'essential' | 'standard' | 'premium' | 'luxury';
type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential';
type MealPlan = 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
type TransportType = 'sedan' | 'suv' | 'luxury' | 'minivan';
type ActivityLevel = 'relaxed' | 'moderate' | 'active' | 'extreme';

const categoryImages = {
  standardRoom: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
  deluxeRoom: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  suiteRoom: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  presidentialSuite: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
  gardenView: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
  poolView: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
  cityView: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
  mountainView: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
  breakfast: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
  halfBoard: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=800&q=80",
  fullBoard: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
  allInclusive: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
  sedan: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
  suv: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
  luxuryCar: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  minivan: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80",
  fortVisit: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
  cityTour: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
  cookingClass: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
  yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
  spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
  trekking: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
  photography: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=800&q=80",
  museum: "https://images.unsplash.com/photo-1577099448232-3269c2f2729a?auto=format&fit=crop&w=800&q=80",
  boatRide: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&w=800&q=80",
  safari: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80",
};

function EnhancedCustomization({ 
  upgraded, 
  setUpgraded, 
  addedStop, 
  tripTotal, 
  onNext 
}: { 
  upgraded: boolean; 
  setUpgraded: (value: boolean) => void; 
  addedStop: boolean; 
  tripTotal: number; 
  onNext: () => void;
}) {
  const [packageTier, setPackageTier] = useState<PackageTier>('standard');
  const [roomType, setRoomType] = useState<RoomType>('standard');
  const [roomView, setRoomView] = useState<'garden' | 'pool' | 'city' | 'mountain'>('garden');
  const [extraBed, setExtraBed] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan>('breakfast');
  const [dietaryPreference, setDietaryPreference] = useState<'none' | 'vegetarian' | 'vegan' | 'gluten_free' | 'halal'>('none');
  const [specialOccasion, setSpecialOccasion] = useState<'none' | 'anniversary' | 'birthday' | 'honeymoon'>('none');
  const [transportType, setTransportType] = useState<TransportType>('sedan');
  const [driverService, setDriverService] = useState<'self' | 'driver' | 'chauffeur'>('driver');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [selectedActivities, setSelectedActivities] = useState<string[]>(['fort_visit']);
  const [groupTour, setGroupTour] = useState<boolean>(true);
  const [privateGuide, setPrivateGuide] = useState<boolean>(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [travelInsurance, setTravelInsurance] = useState<boolean>(false);
  const [priorityCheckin, setPriorityCheckin] = useState<boolean>(false);
  const [earlyCheckin, setEarlyCheckin] = useState<boolean>(false);
  const [lateCheckout, setLateCheckout] = useState<boolean>(false);
  const [airportTransfer, setAirportTransfer] = useState<boolean>(false);
  const [welcomeDrink, setWelcomeDrink] = useState<boolean>(true);

  const tierPrices = {
    essential: { base: 0, label: 'Essential', color: 'bg-moss/10 text-moss' },
    standard: { base: 1200, label: 'Standard', color: 'bg-teal/10 text-teal' },
    premium: { base: 3200, label: 'Premium', color: 'bg-saffron/10 text-saffron' },
    luxury: { base: 6200, label: 'Luxury', color: 'bg-coral/10 text-coral' },
  };

  const roomPrices = {
    standard: 0,
    deluxe: 800,
    suite: 1800,
    presidential: 3800,
  };

  const viewPrices = {
    garden: 0,
    pool: 300,
    city: 500,
    mountain: 800,
  };

  const mealPrices = {
    breakfast: 0,
    half_board: 600,
    full_board: 1200,
    all_inclusive: 2200,
  };

  const transportPrices = {
    sedan: 0,
    suv: 800,
    luxury: 2200,
    minivan: 1200,
  };

  const activityPrices: Record<string, number> = {
    fort_visit: 0,
    city_tour: 600,
    cooking_class: 900,
    yoga: 800,
    spa: 1500,
    trekking: 1100,
    photography: 1200,
    museum: 400,
    boat_ride: 700,
    safari: 1800,
  };

  const addonPrices: Record<string, number> = {
    'guided_tour': 500,
    'audio_guide': 200,
    'skip_the_line': 400,
    'transport_included': 300,
    'lunch_included': 400,
  };

  const baseHotelPrice = upgraded ? 14200 : 13000;
  const tierCost = tierPrices[packageTier].base;
  const roomCost = roomPrices[roomType] + viewPrices[roomView] + (extraBed ? 500 : 0);
  const mealCost = mealPrices[mealPlan];
  const transportCost = transportPrices[transportType] + (driverService === 'chauffeur' ? 1200 : 0);
  const activityCost = selectedActivities.reduce((sum, id) => sum + (activityPrices[id] || 0), 0);
  const addonCost = selectedAddons.reduce((sum, id) => sum + (addonPrices[id] || 0), 0);
  const extraCosts = (travelInsurance ? 800 : 0) + (priorityCheckin ? 400 : 0) + (earlyCheckin ? 300 : 0) + (lateCheckout ? 300 : 0) + (airportTransfer ? 600 : 0);
  
  const hotelsPrice = baseHotelPrice + tierCost + roomCost + mealCost;
  const grandTotal = hotelsPrice + transportCost + activityCost + addonCost + extraCosts + (addedStop ? 240 : 0);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const feasibilityChecks = [
    { label: "Room availability", status: roomType === 'presidential' ? "limited" : "available", detail: roomType === 'presidential' ? "1 suite left" : "Available" },
    { label: "Driver schedule", status: "available", detail: "Confirmed" },
    { label: "Activity slots", status: activityLevel === 'extreme' ? "limited" : "available", detail: activityLevel === 'extreme' ? "2 spots left" : "Available" },
    { label: "Budget alignment", status: grandTotal <= 70000 ? "available" : "limited", detail: grandTotal <= 70000 ? "Within budget" : "Near limit" },
    { label: "Meal availability", status: mealPlan === 'all_inclusive' ? "limited" : "available", detail: mealPlan === 'all_inclusive' ? "Limited spots" : "Available" },
  ];

  const feasibilityScore = Math.round((feasibilityChecks.filter(c => c.status === 'available').length / feasibilityChecks.length) * 100);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="section-heading">
        <MiniLabel tone="teal">03 / Modular Customize</MiniLabel>
        <h1>Make the itinerary feel <em>like yours.</em></h1>
        <p>Swap the parts that matter. Orbit keeps the route, margin, and driver rest buffer in view.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.keys(tierPrices) as PackageTier[]).map((tier) => {
          const info = tierPrices[tier];
          const isSelected = packageTier === tier;
          const isRecommended = tier === 'standard';
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setPackageTier(tier)}
              className={cn(
                "rounded-2xl border-2 p-4 text-left transition-all duration-300",
                isSelected 
                  ? "border-teal/40 bg-teal/5 shadow-[0_4px_20px_rgba(13,148,136,0.08)]" 
                  : "border-ink/10 bg-paper hover:border-teal/20",
                isRecommended && !isSelected && "border-amber/20 bg-amber/5"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isSelected ? "text-teal" : "text-ink-muted"
                )}>
                  {info.label}
                </span>
                {isRecommended && (
                  <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[8px] font-bold text-amber">⭐ Popular</span>
                )}
                {isSelected && (
                  <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[8px] font-bold text-teal">✓</span>
                )}
              </div>
              <p className="mt-2 font-display text-xl font-semibold tracking-tighter">
                +₹{info.base.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {tier === 'essential' && 'Core experience'}
                {tier === 'standard' && 'Enhanced comfort'}
                {tier === 'premium' && 'Premium luxury'}
                {tier === 'luxury' && 'Ultimate experience'}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card className="p-5 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Hotel size={16} className="text-teal" />
              <div>
                <p className="field-label">Accommodation</p>
                <p className="text-xs text-ink-muted">Customize your stay</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-ink mb-2">Room Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'standard', label: 'Standard', price: 0, img: categoryImages.standardRoom },
                    { id: 'deluxe', label: 'Deluxe', price: 800, img: categoryImages.deluxeRoom },
                    { id: 'suite', label: 'Suite', price: 1800, img: categoryImages.suiteRoom },
                    { id: 'presidential', label: 'Presidential', price: 3800, img: categoryImages.presidentialSuite },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRoomType(option.id)}
                      className={cn(
                        "rounded-xl overflow-hidden border-2 transition-all text-left",
                        roomType === option.id 
                          ? "border-teal/40 shadow-[0_0_0_4px_rgba(13,148,136,0.15)]" 
                          : "border-ink/10 hover:border-teal/20"
                      )}
                    >
                      <img 
                        src={option.img} 
                        alt={option.label}
                        className="h-20 w-full object-cover"
                      />
                      <div className="px-3 py-2">
                        <span className="text-sm font-bold text-ink">{option.label}</span>
                        <p className="text-[10px] text-ink-muted">+₹{option.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-ink mb-2">Room View</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'garden', label: 'Garden', price: 0, img: categoryImages.gardenView },
                    { id: 'pool', label: 'Pool', price: 300, img: categoryImages.poolView },
                    { id: 'city', label: 'City', price: 500, img: categoryImages.cityView },
                    { id: 'mountain', label: 'Mountain', price: 800, img: categoryImages.mountainView },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRoomView(option.id)}
                      className={cn(
                        "rounded-xl overflow-hidden border-2 transition-all text-left",
                        roomView === option.id 
                          ? "border-teal/40 shadow-[0_0_0_4px_rgba(13,148,136,0.15)]" 
                          : "border-ink/10 hover:border-teal/20"
                      )}
                    >
                      <img 
                        src={option.img} 
                        alt={option.label}
                        className="h-16 w-full object-cover"
                      />
                      <div className="px-3 py-1.5">
                        <span className="text-xs font-bold text-ink">{option.label}</span>
                        <p className="text-[9px] text-ink-muted">+₹{option.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setExtraBed(!extraBed)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                    extraBed ? "border-teal/30 bg-teal/5 text-teal" : "border-ink/10 text-ink-muted"
                  )}
                >
                  {extraBed ? <Check size={14} /> : <Plus size={14} />}
                  Extra Bed (+₹500)
                </button>
                <button
                  type="button"
                  onClick={() => setEarlyCheckin(!earlyCheckin)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                    earlyCheckin ? "border-teal/30 bg-teal/5 text-teal" : "border-ink/10 text-ink-muted"
                  )}
                >
                  {earlyCheckin ? <Check size={14} /> : <Plus size={14} />}
                  Early Check-in (+₹300)
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-5 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Utensils size={16} className="text-saffron" />
              <div>
                <p className="field-label">Meal Plan</p>
                <p className="text-xs text-ink-muted">Choose your dining experience</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'breakfast', label: 'Breakfast', price: 0, img: categoryImages.breakfast },
                  { id: 'half_board', label: 'Half Board', price: 600, img: categoryImages.halfBoard },
                  { id: 'full_board', label: 'Full Board', price: 1200, img: categoryImages.fullBoard },
                  { id: 'all_inclusive', label: 'All Inclusive', price: 2200, img: categoryImages.allInclusive },
                ] as const).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMealPlan(option.id)}
                    className={cn(
                      "rounded-xl overflow-hidden border-2 transition-all text-left",
                      mealPlan === option.id 
                        ? "border-teal/40 shadow-[0_0_0_4px_rgba(13,148,136,0.15)]" 
                        : "border-ink/10 hover:border-teal/20"
                    )}
                  >
                    <img 
                      src={option.img} 
                      alt={option.label}
                      className="h-16 w-full object-cover"
                    />
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-bold text-ink">{option.label}</span>
                      <p className="text-[9px] text-ink-muted">+₹{option.price}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold text-ink mb-2">Dietary Preference</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'none', label: 'Standard' },
                    { id: 'vegetarian', label: '🌱 Vegetarian' },
                    { id: 'vegan', label: '🌿 Vegan' },
                    { id: 'gluten_free', label: '🌾 Gluten Free' },
                    { id: 'halal', label: '☪️ Halal' },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDietaryPreference(option.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                        dietaryPreference === option.id 
                          ? "border-teal/30 bg-teal/5 text-teal" 
                          : "border-ink/10 text-ink-muted hover:border-teal/20"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-ink mb-2">Special Occasion</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'none', label: 'None' },
                    { id: 'anniversary', label: '💑 Anniversary' },
                    { id: 'birthday', label: '🎂 Birthday' },
                    { id: 'honeymoon', label: '🌹 Honeymoon' },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSpecialOccasion(option.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                        specialOccasion === option.id 
                          ? "border-teal/30 bg-teal/5 text-teal" 
                          : "border-ink/10 text-ink-muted hover:border-teal/20"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Car size={16} className="text-amber" />
              <div>
                <p className="field-label">Transport</p>
                <p className="text-xs text-ink-muted">Choose your ride</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'sedan', label: 'Sedan', price: 0, img: categoryImages.sedan },
                  { id: 'suv', label: 'SUV', price: 800, img: categoryImages.suv },
                  { id: 'luxury', label: 'Luxury', price: 2200, img: categoryImages.luxuryCar },
                  { id: 'minivan', label: 'Minivan', price: 1200, img: categoryImages.minivan },
                ] as const).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTransportType(option.id)}
                    className={cn(
                      "rounded-xl overflow-hidden border-2 transition-all text-left",
                      transportType === option.id 
                        ? "border-teal/40 shadow-[0_0_0_4px_rgba(13,148,136,0.15)]" 
                        : "border-ink/10 hover:border-teal/20"
                    )}
                  >
                    <img 
                      src={option.img} 
                      alt={option.label}
                      className="h-16 w-full object-cover"
                    />
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-bold text-ink">{option.label}</span>
                      <p className="text-[9px] text-ink-muted">+₹{option.price}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs font-bold text-ink mb-2">Driver Service</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'self', label: 'Self Drive', price: 0 },
                    { id: 'driver', label: 'With Driver', price: 0 },
                    { id: 'chauffeur', label: '👔 Chauffeur', price: 1200 },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDriverService(option.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                        driverService === option.id 
                          ? "border-teal/30 bg-teal/5 text-teal" 
                          : "border-ink/10 text-ink-muted hover:border-teal/20"
                      )}
                    >
                      {option.label} {option.price > 0 && `+₹${option.price}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Compass size={16} className="text-coral" />
              <div>
                <p className="field-label">Activities</p>
                <p className="text-xs text-ink-muted">Choose your experiences</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-ink mb-2">Activity Level</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'relaxed', label: '🧘 Relaxed' },
                    { id: 'moderate', label: '🚶 Moderate' },
                    { id: 'active', label: '🏃 Active' },
                    { id: 'extreme', label: '⚡ Extreme' },
                  ] as const).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setActivityLevel(option.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                        activityLevel === option.id 
                          ? "border-teal/30 bg-teal/5 text-teal" 
                          : "border-ink/10 text-ink-muted hover:border-teal/20"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-ink mb-2">Select Activities</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'fort_visit', label: 'Fort Visit', price: 0, img: categoryImages.fortVisit },
                    { id: 'city_tour', label: 'City Tour', price: 600, img: categoryImages.cityTour },
                    { id: 'cooking_class', label: 'Cooking Class', price: 900, img: categoryImages.cookingClass },
                    { id: 'yoga', label: 'Yoga Session', price: 800, img: categoryImages.yoga },
                    { id: 'spa', label: 'Spa Day', price: 1500, img: categoryImages.spa },
                    { id: 'trekking', label: 'Trekking', price: 1100, img: categoryImages.trekking },
                    { id: 'photography', label: 'Photo Tour', price: 1200, img: categoryImages.photography },
                    { id: 'museum', label: 'Museum Visit', price: 400, img: categoryImages.museum },
                    { id: 'boat_ride', label: 'Boat Ride', price: 700, img: categoryImages.boatRide },
                    { id: 'safari', label: 'Safari', price: 1800, img: categoryImages.safari },
                  ].map((activity) => {
                    const isSelected = selectedActivities.includes(activity.id);
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => toggleActivity(activity.id)}
                        className={cn(
                          "rounded-xl overflow-hidden border-2 transition-all text-left",
                          isSelected 
                            ? "border-teal/40 shadow-[0_0_0_4px_rgba(13,148,136,0.15)]" 
                            : "border-ink/10 hover:border-teal/20"
                        )}
                      >
                        <img 
                          src={activity.img} 
                          alt={activity.label}
                          className="h-14 w-full object-cover"
                        />
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <span className="text-[10px] font-bold text-ink">{activity.label}</span>
                          {activity.price > 0 && (
                            <span className="text-[8px] text-ink-muted">+₹{activity.price}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setGroupTour(!groupTour)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                    groupTour ? "border-teal/30 bg-teal/5 text-teal" : "border-ink/10 text-ink-muted"
                  )}
                >
                  {groupTour ? <Check size={14} /> : <Plus size={14} />}
                  Group Tour
                </button>
                <button
                  type="button"
                  onClick={() => setPrivateGuide(!privateGuide)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all",
                    privateGuide ? "border-teal/30 bg-teal/5 text-teal" : "border-ink/10 text-ink-muted"
                  )}
                >
                  {privateGuide ? <Check size={14} /> : <Plus size={14} />}
                  Private Guide (+₹800)
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-saffron" />
              <div>
                <p className="field-label">Add-ons & Extras</p>
                <p className="text-xs text-ink-muted">Enhance your experience</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'guided_tour', label: '🎯 Guided Tour', price: 500 },
                  { id: 'audio_guide', label: '🎧 Audio Guide', price: 200 },
                  { id: 'skip_the_line', label: '⏭️ Skip-the-Line', price: 400 },
                  { id: 'transport_included', label: '🚌 Transport', price: 300 },
                  { id: 'lunch_included', label: '🍱 Lunch', price: 400 },
                ].map((addon) => {
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-2 transition-all",
                        isSelected 
                          ? "border-teal/30 bg-teal/5" 
                          : "border-ink/8 hover:border-teal/20"
                      )}
                    >
                      <span className="text-xs font-bold text-ink">{addon.label}</span>
                      <span className="text-[9px] text-ink-muted">+₹{addon.price}</span>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-ink/8 pt-3">
                <p className="text-xs font-bold text-ink mb-2">Extra Services</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'insurance', label: '🛡️ Travel Insurance', price: 800, state: travelInsurance, setState: setTravelInsurance },
                    { id: 'priority', label: '⭐ Priority Check-in', price: 400, state: priorityCheckin, setState: setPriorityCheckin },
                    { id: 'late_checkout', label: '⏰ Late Checkout', price: 300, state: lateCheckout, setState: setLateCheckout },
                    { id: 'airport', label: '✈️ Airport Transfer', price: 600, state: airportTransfer, setState: setAirportTransfer },
                  ].map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => service.setState(!service.state)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold transition-all",
                        service.state 
                          ? "border-teal/30 bg-teal/5 text-teal" 
                          : "border-ink/10 text-ink-muted hover:border-teal/20"
                      )}
                    >
                      {service.state ? <Check size={12} className="inline mr-1" /> : <Plus size={12} className="inline mr-1" />}
                      {service.label} +₹{service.price}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-amber/20 bg-amber/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber" />
                <p className="text-xs font-bold text-ink">Feasibility Check</p>
              </div>
              <span className="text-xs font-bold text-moss">
                {feasibilityScore}% feasible
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {feasibilityChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-1.5 text-xs">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    check.status === 'available' ? "bg-moss" : "bg-amber"
                  )} />
                  <span className="text-ink-muted">{check.label}</span>
                  <span className={cn(
                    "text-[9px] font-bold",
                    check.status === 'available' ? "text-moss" : "text-amber"
                  )}>
                    {check.status === 'available' ? '✓' : '⚠️'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="sticky top-28 p-5">
            <div className="flex items-center justify-between">
              <MiniLabel>Live delta pricing</MiniLabel>
              <span className="text-[10px] font-bold text-teal">Real-time</span>
            </div>

            <div className="mt-4 rounded-2xl bg-ink p-4 text-paper">
              <p className="text-xs text-paper/52">Total trip cost</p>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tighter">
                ₹{grandTotal.toLocaleString("en-IN")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-paper/10 px-2 py-0.5 text-[8px] font-bold text-teal-light">
                  {tierPrices[packageTier].label}
                </span>
                {selectedActivities.length > 0 && (
                  <span className="rounded-full bg-paper/10 px-2 py-0.5 text-[8px] font-bold text-saffron-light">
                    {selectedActivities.length} activities
                  </span>
                )}
                {selectedAddons.length > 0 && (
                  <span className="rounded-full bg-paper/10 px-2 py-0.5 text-[8px] font-bold text-coral-light">
                    +{selectedAddons.length} add-ons
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-b border-ink/8 pb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-muted">Hotel · {roomType}</span>
                <strong>₹{hotelsPrice.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Transport · {transportType}</span>
                <strong>₹{transportCost.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Activities</span>
                <strong>₹{activityCost.toLocaleString("en-IN")}</strong>
              </div>
              {selectedAddons.length > 0 && (
                <div className="flex justify-between text-teal">
                  <span className="text-ink-muted">Add-ons</span>
                  <strong>+₹{addonCost.toLocaleString("en-IN")}</strong>
                </div>
              )}
              {extraCosts > 0 && (
                <div className="flex justify-between text-coral">
                  <span className="text-ink-muted">Extras</span>
                  <strong>+₹{extraCosts.toLocaleString("en-IN")}</strong>
                </div>
              )}
              {addedStop && (
                <div className="flex justify-between">
                  <span className="text-ink-muted">Local stop</span>
                  <strong className="text-teal">+₹240</strong>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-moss/8 p-3">
              <BadgeCheck size={16} className="shrink-0 text-moss" />
              <p className="text-xs leading-5 text-ink/70">
                {feasibilityScore >= 80 
                  ? "Route feasible. Driver rest buffer preserved."
                  : "Some constraints need attention. Review recommended."}
              </p>
            </div>

            <Button 
              onClick={onNext} 
              className="mt-5 h-11 w-full rounded-xl bg-ink font-bold text-paper hover:bg-ink/90"
            >
              Review trip <ArrowRight size={16} className="ml-2" />
            </Button>

            <p className="mt-3 text-center text-[10px] text-ink-muted/60">
              {feasibilityScore}% feasible · {selectedActivities.length} activities
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DIGITAL PASS COMPONENT
// =============================================================================

function QrBlock() {
  return <div className="qr-block" aria-label="Decorative QR voucher"><div className="qr-grid">{Array.from({ length: 81 }).map((_, index) => <span key={index} className={cn("qr-cell", [0, 1, 2, 3, 9, 11, 18, 19, 20, 27, 29, 36, 37, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80].includes(index) && "qr-fill")} />)}</div></div>;
}

// WhatsApp Chat Simulator
function WhatsAppChatSimulator({ 
  vendorName = "Sharma Ji Samosa Hub",
  vendorIcon = "🛍️",
  onConfirm,
  isConfirmed,
}: { 
  vendorName?: string;
  vendorIcon?: string;
  onConfirm?: () => void;
  isConfirmed?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      text: `👋 Welcome! This is ${vendorName}. How can I help you today?`,
    },
    {
      id: "2",
      role: "assistant",
      text: "We have a special fixed rate for you: ₹120. No hidden charges!",
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(isConfirmed || false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showVoucher, setShowVoucher] = useState(false);
  const [chatActive, setChatActive] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getVendorResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
      return "Hello there! 👋 How can I assist you with your order today?";
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('₹') || lower.includes('rate') || lower.includes('how much')) {
      return "Our fixed price is ₹120 for this item. We maintain transparent rates for all our customers. Would you like to confirm your order? 🏷️";
    }
    if (lower.includes('time') || lower.includes('when') || lower.includes('arrival') || lower.includes('ready')) {
      return "We'll have your order ready in 15 minutes. We're preparing it fresh! ⏱️";
    }
    if (lower.includes('confirm') || lower.includes('yes') || lower.includes('ok') || lower.includes('add') || lower.includes('order')) {
      return "Excellent! ✅ Your order has been confirmed. I'll share a QR voucher with you shortly. We look forward to serving you!";
    }
    if (lower.includes('thank') || lower.includes('thanks') || lower.includes('thank you')) {
      return "You're most welcome! 😊 It's our pleasure. Safe travels and enjoy your journey!";
    }
    if (lower.includes('voucher') || lower.includes('qr') || lower.includes('code')) {
      return "Here's your QR voucher! 📱 Just show this at our shop for quick service. Tap the QR button below to see it.";
    }
    if (lower.includes('clean') || lower.includes('hygiene') || lower.includes('safety')) {
      return "We maintain the highest hygiene standards! ⭐ 4.8★ rating for cleanliness. Our shop is regularly sanitized and all staff wear gloves. 🧤";
    }
    if (lower.includes('menu') || lower.includes('food') || lower.includes('eat') || lower.includes('snack')) {
      return "We have a variety of freshly made snacks! 🌯 Our specialty is samosas, but we also have kachoris, jalebis, and refreshing chai. All at fixed, transparent prices!";
    }
    if (lower.includes('privacy') || lower.includes('phone') || lower.includes('number') || lower.includes('hidden')) {
      return "Your privacy is protected! 🔒 I can see you as Customer #TRV-8029. Your real phone number is completely hidden. We love this system!";
    }
    if (lower.includes('bye') || lower.includes('goodbye')) {
      return "Goodbye! 👋 It was a pleasure chatting with you. Safe travels and we hope to see you soon!";
    }
    
    return "Thanks for your message! I'm here to help. Would you like to know about our menu, pricing, or confirm an order? Just ask! 😊";
  };

  const sendMessage = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || !chatActive) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getVendorResponse(trimmed);
      const vendorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: responseText,
      };
      
      setMessages(prev => [...prev, vendorMsg]);
      setIsTyping(false);

      if (trimmed.toLowerCase().includes('confirm') || 
          trimmed.toLowerCase().includes('yes') || 
          trimmed.toLowerCase().includes('ok')) {
        setHasConfirmed(true);
        if (onConfirm) onConfirm();
        setTimeout(() => setShowVoucher(true), 500);
      }
    }, 800 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-105 bg-[#e9efe9] rounded-2xl overflow-hidden border border-ink/8">
      <div className="flex items-center gap-3 border-b border-ink/8 bg-paper px-4 py-3 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/15 text-2xl">
          {vendorIcon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink">{vendorName}</p>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "h-2 w-2 rounded-full",
              chatActive ? "bg-moss animate-pulse" : "bg-ink-muted"
            )} />
            <span className="text-[10px] text-ink-muted">
              {chatActive ? "Online · Usually replies instantly" : "Offline"}
            </span>
          </div>
        </div>
        <button type="button" className="icon-button h-8 w-8" aria-label="More options">
          <MoreVertical size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.map((msg) => (
          <div key={msg.id} className={cn(
            "flex",
            msg.role === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-5 shadow-sm",
              msg.role === 'user' 
                ? "bg-teal text-white rounded-br-sm" 
                : "bg-white text-ink rounded-bl-sm"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" />
              </div>
            </div>
          </div>
        )}
        
        {showVoucher && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 max-w-[85%] border border-teal/20 animate-fade-up">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal/10">
                  <QrCode size={32} className="text-teal" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">QR Voucher</p>
                  <p className="text-[10px] text-ink-muted">Fixed rate · ₹120</p>
                  <p className="text-[9px] text-teal font-semibold">✓ Verified</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-ink/8 bg-paper px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <button type="button" className="icon-button h-8 w-8 shrink-0" aria-label="Attachment">
            <Paperclip size={14} />
          </button>
          <div className="flex-1 relative">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message vendor..."
              className="w-full rounded-xl border border-ink/10 bg-paper-dark px-4 py-2 text-sm text-ink outline-none focus:border-teal/30 focus:ring-2 focus:ring-teal/10"
              disabled={!chatActive}
            />
          </div>
          <button
            type="button"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !chatActive}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
              inputMessage.trim() && chatActive
                ? "bg-teal text-white hover:bg-teal-dark"
                : "bg-ink/5 text-ink-muted/40 cursor-not-allowed"
            )}
          >
            <Send size={15} />
          </button>
        </div>
        {chatActive && (
          <div className="mt-1 flex items-center gap-3 px-1">
            <span className="text-[9px] text-ink-muted/60 flex items-center gap-1">
              <LockKeyhole size={10} className="text-teal" />
              Privacy relay active
            </span>
            <span className="text-[9px] text-ink-muted/60">
              {messages.filter(m => m.role === 'assistant').length} vendor messages
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function DigitalPass({ 
  destination, 
  onAdapt, 
  vendorConfirmed,
  vendors,
  onConfirmVendor
}: { 
  destination: string; 
  onAdapt: () => void; 
  vendorConfirmed: boolean;
  vendors: VendorConfirmation[];
  onConfirmVendor: (id: string) => void;
}) {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [vendorChatConfirmed, setVendorChatConfirmed] = useState(false);
  
  const allConfirmed = vendors.every(v => v.status === 'confirmed');
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <MiniLabel tone="teal">05 / Live Digital Pass</MiniLabel>
          <h1>Your trip, <em>held together.</em></h1>
          <p>Offline-ready details, privacy-safe local chat, and one button for the unexpected.</p>
        </div>
        <StatusChip tone={allConfirmed ? "green" : "teal"}>
          {allConfirmed ? "All vendors confirmed" : `${pendingVendors.length} vendor${pendingVendors.length > 1 ? 's' : ''} pending`}
        </StatusChip>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="pass-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Logo variant="tiny" className="opacity-80" />
                <span className="eyebrow text-paper/55">Orbit pass</span>
              </div>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-none tracking-tighter">
                {destination}, with room<br />for <em className="text-saffron-light">wonder.</em>
              </h2>
            </div>
            <span className="rounded-full border border-paper/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-paper/58">
              TRP · 8029
            </span>
          </div>
          
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-paper/15 pt-5 sm:grid-cols-4">
            <div>
              <p className="eyebrow text-paper/42">Traveler</p>
              <p className="mt-1 text-sm font-semibold">Aanya Sharma</p>
            </div>
            <div>
              <p className="eyebrow text-paper/42">Dates</p>
              <p className="mt-1 text-sm font-semibold">12–14 Feb</p>
            </div>
            <div>
              <p className="eyebrow text-paper/42">Pickup</p>
              <p className="mt-1 text-sm font-semibold">Home</p>
            </div>
            <div>
              <p className="eyebrow text-paper/42">Status</p>
              <p className="mt-1 text-sm font-semibold text-teal-light">Live</p>
            </div>
          </div>
          
          <div className="mt-6 border-t border-paper/15 pt-5">
            <p className="eyebrow text-paper/42">Vendor Status</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {vendors.map((vendor) => {
                const Icon = vendor.icon;
                const isConfirmed = vendor.status === 'confirmed';
                return (
                  <div 
                    key={vendor.id}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-paper/15 px-3 py-2",
                      isConfirmed ? "border-moss/30 bg-moss/10" : "border-paper/10 bg-paper/5"
                    )}
                  >
                    <Icon size={13} className={isConfirmed ? "text-moss" : "text-paper/40"} />
                    <span className="flex-1 text-[10px] font-medium text-paper/75">{vendor.name}</span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase",
                      isConfirmed ? "text-moss" : "text-amber"
                    )}>
                      {isConfirmed ? "✓ Confirmed" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button 
              type="button" 
              onClick={() => toast.success("Driver tracking opened · Rajesh is 12 minutes ahead")} 
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-paper/10 px-4 py-3 text-xs font-bold text-paper hover:bg-paper/15"
            >
              <Navigation size={15} /> Track driver
            </button>
            <button 
              type="button" 
              onClick={() => {
                setShowWhatsApp(!showWhatsApp);
                if (!showWhatsApp) toast.success("Privacy relay chat opened with vendor");
              }} 
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-paper/10 px-4 py-3 text-xs font-bold text-paper hover:bg-paper/15"
            >
              <MessageCircle size={15} /> {showWhatsApp ? "Close chat" : "Privacy chat"}
            </button>
          </div>
        </Card>
        
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <MiniLabel>Today · Day 1</MiniLabel>
                <p className="mt-2 text-sm font-bold text-ink">Your travel drawer</p>
              </div>
              <QrBlock />
            </div>
            
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => toast.success("QR voucher opened")} className="pass-item text-left">
                <Store size={15} className="text-saffron" />
                <div><strong>Local stop</strong><span>QR voucher · Fixed rate</span></div>
                <ArrowRight size={14} className="ml-auto text-ink-muted" />
              </button>
              <div className="pass-item">
                <Hotel size={15} className="text-teal" />
                <div><strong>Hotel check-in</strong><span>17:30 · Pushkar</span></div>
              </div>
              <div className="pass-item">
                <Phone size={15} className="text-teal" />
                <div><strong>Driver contact</strong><span>Rajesh · masked</span></div>
              </div>
              <div className="pass-item">
                <FileCheck2 size={15} className="text-moss" />
                <div><strong>Offline ready</strong><span>All details saved</span></div>
              </div>
            </div>
          </Card>
          
          {showWhatsApp && (
  <Card className="p-3 border-teal/20 animate-fade-up">
    {vendors.some(v => v.type === 'vendor' && v.status === 'confirmed') ? (
      <WhatsAppChatSimulator 
        vendorName="Sharma Ji Samosa Hub"
        vendorIcon="🛍️"
        onConfirm={() => {
          setVendorChatConfirmed(true);
          const vendor = vendors.find(v => v.type === 'vendor');
          if (vendor) onConfirmVendor(vendor.id);
        }}
        isConfirmed={vendorChatConfirmed}
      />
    ) : (
      <div className="text-center py-8 text-ink-muted">
        <LockKeyhole size={32} className="mx-auto mb-3 text-ink/30" />
        <p className="text-sm font-bold">Vendor not yet confirmed</p>
        <p className="text-xs mt-1">Please confirm the vendor first to start chatting</p>
        <Button 
          onClick={() => setShowWhatsApp(false)}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          Close
        </Button>
      </div>
    )}
  </Card>
)}
          
          <button 
            type="button" 
            onClick={onAdapt} 
            className="adapt-button"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber text-ink">
              <CloudRain size={19} />
            </span>
            <span className="flex-1 text-left">
              <MiniLabel tone="amber">Weather watch</MiniLabel>
              <strong className="mt-1 block text-sm text-ink">Adapt My Day</strong>
              <small className="mt-1 block text-xs text-ink-muted">Rain may affect your outdoor trek at 2:00 PM.</small>
            </span>
            <ArrowRight size={17} className="text-ink-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// RIPPLE ENGINE COMPONENT
// =============================================================================

type CascadeStep = {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  delay: number;
};

// LINE ~3200 - Replace CascadeAnimation component
function CascadeAnimation({ 
  isResolving, 
  resolved,
  onComplete,
  vendors,  // ADD THIS NEW PROP
}: { 
  isResolving: boolean;
  resolved: boolean;
  onComplete?: () => void;
  vendors: VendorConfirmation[];  // ADD THIS NEW TYPE
}) {
  const [steps, setSteps] = useState<CascadeStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [cascadeStarted, setCascadeStarted] = useState(false);

  // Build cascade steps from actual vendors
  const getCascadeSteps = useCallback((): CascadeStep[] => {
    const activeVendors = vendors.filter(v => v.status === 'confirmed' || v.status === 'pending');
    
    // If no vendors, use a minimal default
    if (activeVendors.length === 0) {
      return [
        { 
          id: 'traveler', 
          label: 'Traveler: Aanya S.', 
          icon: UserRound, 
          status: 'pending',
          description: 'Updating itinerary',
          delay: 0
        },
      ];
    }

    return activeVendors.map((vendor, index) => ({
      id: vendor.id,
      label: vendor.name,
      icon: vendor.icon,
      status: 'pending' as const,
      description: `Updating ${vendor.type} details`,
      delay: index * 150, // FASTER: 300ms between steps
    }));
  }, [vendors]);

  // Start cascade when resolving
  useEffect(() => {
    if (isResolving && !cascadeStarted && !resolved) {
      setCascadeStarted(true);
      const initialSteps = getCascadeSteps();
      setSteps(initialSteps);
      setIsProcessing(true);
      setProgress(0);
      setCompletedCount(0);

      const totalSteps = initialSteps.length;
      let completed = 0;

      initialSteps.forEach((step, index) => {
        const delay = step.delay + 200;

        setTimeout(() => {
          setSteps(prev => prev.map((s, i) => 
            i === index ? { ...s, status: 'processing' } : s
          ));

          // FASTER: 300ms processing
          setTimeout(() => {
            const success = Math.random() > 0.05;
            setSteps(prev => prev.map((s, i) => 
              i === index ? { ...s, status: success ? 'completed' : 'failed' } : s
            ));
            
            completed++;
            setCompletedCount(completed);
            setProgress((completed / totalSteps) * 100);

            if (completed === totalSteps) {
              setTimeout(() => {
                setIsProcessing(false);
                if (onComplete) onComplete();
              }, 200);
            }
          },150 + Math.random() * 100);
        }, delay);
      });
    }
  }, [isResolving, resolved, cascadeStarted, getCascadeSteps, onComplete]);

  useEffect(() => {
    if (resolved) {
      setIsProcessing(false);
    }
  }, [resolved]);

  const allCompleted = steps.every(s => s.status === 'completed') && steps.length > 0;
  const hasFailed = steps.some(s => s.status === 'failed');

  if (steps.length === 0 && !isResolving) {
    return (
      <div className="text-center py-4 text-ink-muted text-sm">
        No vendors to update
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-ink">Cascade Update</p>
        <span className="text-[10px] font-bold text-ink-muted">
          {completedCount}/{steps.length} complete
        </span>
      </div>

      <Progress value={progress} className="h-1.5" />

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.status === 'completed';
          const isProcessing = step.status === 'processing';
          const isFailed = step.status === 'failed';
          const isPending = step.status === 'pending';

          return (
            <div 
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-300",
                isCompleted ? "border-moss/20 bg-moss/5" : "border-ink/8 bg-paper-dark/30",
                isProcessing && "border-amber/20 bg-amber/5"
              )}
            >
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                isCompleted ? "bg-moss/10 text-moss" : "bg-ink/5 text-ink-muted",
                isProcessing && "bg-amber/10 text-amber"
              )}>
                <Icon size={14} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink">{step.label}</p>
                <p className="text-[10px] text-ink-muted">{step.description}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {isCompleted && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-moss animate-fade-up">
                    <CheckCircle2 size={13} /> Done
                  </span>
                )}
                {isProcessing && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber">
                    <Loader2 size={13} className="animate-spin" /> Processing
                  </span>
                )}
                {isFailed && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-coral">
                    <AlertTriangle size={13} /> Failed
                  </span>
                )}
                {isPending && (
                  <span className="text-[10px] text-ink-muted/50">Waiting</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {allCompleted && !isProcessing && (
        <div className="rounded-xl bg-moss/10 p-3 text-center text-xs font-bold text-moss animate-fade-up">
          <CheckCircle2 size={16} className="inline mr-2" />
          All systems updated! Trip successfully adapted.
        </div>
      )}

      {hasFailed && !isProcessing && (
        <div className="rounded-xl bg-coral/10 p-3 text-center text-xs font-bold text-coral animate-fade-up">
          <AlertTriangle size={16} className="inline mr-2" />
          Some updates failed. Manual intervention may be needed.
        </div>
      )}
    </div>
  );
}
// LINE ~3350 - Replace RippleOptions component
function RippleOptions({ 
  onResolve, 
  resolved, 
  isResolving, 
  vendors 
}: { 
  onResolve: (key: string) => void; 
  resolved: boolean;
  isResolving: boolean;
  vendors: VendorConfirmation[];
}) {
  const [selectedKey, setSelectedKey] = useState("A");
  const [showCascade, setShowCascade] = useState(false);
  const [cascadeComplete, setCascadeComplete] = useState(false);

  const options = [
    { 
      key: "A", 
      title: "Swap for Indoor Art Gallery", 
      copy: "Keep the day intact. Fits Aanya's culture preference.",
      meta: "No timing change", 
      price: "₹0 delta", 
      selected: true,
      description: "Swap outdoor trek for indoor gallery experience"
    },
    { 
      key: "B", 
      title: "Reschedule trek to Day 3", 
      copy: "Move the outdoor activity after the Pushkar stay.",
      meta: "+45 min on Day 3", 
      price: "+₹400", 
      selected: false,
      description: "Move outdoor trek to Day 3"
    },
    { 
      key: "C", 
      title: "Issue instant refund credit", 
      copy: "Cancel the trek and preserve the rest of the route.",
      meta: "Vendor credit issued", 
      price: "−₹1,800", 
      selected: false,
      description: "Cancel trek and issue credit"
    }
  ];

  const handleResolve = () => {
    setShowCascade(true);
  };

  const handleCascadeComplete = () => {
    setCascadeComplete(true);
    setTimeout(() => {
      onResolve(selectedKey);
    }, 300);
  };

  const activeVendors = vendors.filter(v => v.status === 'confirmed' || v.status === 'pending');
  const hasNoVendors = activeVendors.length === 0;

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="section-heading">
        <MiniLabel tone="amber">06 / Ripple Engine</MiniLabel>
        <h1>The plan changed. <em>The trip doesn't have to.</em></h1>
        <p>Orbit checks time, distance, preferences, vendor availability, and cost—then gives the operator a clear choice.</p>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="border-amber/22 bg-amber/7 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber text-ink">
              <CloudRain size={22} />
            </div>
            <div>
              <MiniLabel tone="amber">Conflict detected</MiniLabel>
              <h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tighter text-ink">Heavy rain at 2:00 PM</h2>
              <p className="mt-3 text-sm leading-6 text-ink/70">Outdoor trek is no longer safe. {activeVendors.length > 0 ? `${activeVendors.length} vendor${activeVendors.length > 1 ? 's' : ''}` : 'No'} affected.</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-3 border-t border-amber/18 pt-5 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-muted">Affected day</span>
              <strong>Day 2 · 12:30–16:00</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Traveler preference</span>
              <strong>Culture · Food</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Operators impacted</span>
              <strong>{activeVendors.length > 0 ? `${activeVendors.length} vendors` : 'None'}</strong>
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-dark">
            <Activity size={15} /> Ripple analysis ready
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between border-b border-ink/8 pb-5">
            <div>
              <MiniLabel>Resolution paths</MiniLabel>
              <p className="mt-2 text-sm font-bold text-ink">Choose how the route should bend.</p>
            </div>
            <span className="rounded-full bg-teal/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-teal">
              3 options
            </span>
          </div>
          
          <div className="mt-5 space-y-3">
            {options.map((option) => (
              <button 
                type="button" 
                key={option.key} 
                onClick={() => !resolved && !isResolving && setSelectedKey(option.key)} 
                className={cn(
                  "ripple-option w-full text-left",
                  selectedKey === option.key && !resolved && !isResolving && "ripple-option-active",
                  resolved && option.key === selectedKey && "ripple-option-resolved"
                )}
                disabled={resolved || isResolving}
              >
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                  selectedKey === option.key && !resolved && !isResolving ? "bg-teal text-white" : "bg-ink/7 text-ink-muted",
                  resolved && option.key === selectedKey && "bg-moss text-white"
                )}>
                  {resolved && option.key === selectedKey ? <Check size={16} /> : option.key}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-sm text-ink">{option.title}</strong>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">{option.copy}</p>
                    </div>
                    {selectedKey === option.key && !resolved && !isResolving && (
                      <span className="rounded-full bg-teal/10 px-2 py-1 text-[10px] font-bold text-teal">Recommended</span>
                    )}
                    {resolved && option.key === selectedKey && (
                      <span className="rounded-full bg-moss/10 px-2 py-1 text-[10px] font-bold text-moss">Applied</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                    <span>{option.meta}</span>
                    <span className={cn(
                      option.price.startsWith("−") ? "text-moss" : 
                      option.price.startsWith("+") ? "text-amber-dark" : "text-teal"
                    )}>
                      {option.price}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {showCascade && (
            <div className="mt-5 pt-5 border-t border-ink/8">
              <CascadeAnimation 
                isResolving={isResolving}
                resolved={cascadeComplete}
                onComplete={handleCascadeComplete}
                vendors={vendors}  // PASS VENDORS TO CASCADE
              />
            </div>
          )}
          
          <Button 
            onClick={handleResolve} 
            disabled={resolved || isResolving || showCascade || hasNoVendors}
            className={cn(
              "mt-5 h-11 w-full rounded-xl font-bold",
              resolved ? "bg-moss text-white hover:bg-moss" : "bg-ink text-paper hover:bg-ink/90",
              hasNoVendors && !resolved && "opacity-50 cursor-not-allowed"
            )}
          >
            {resolved ? (
              <><Check size={16} className="mr-2" /> Ripple resolved across trip</>
            ) : isResolving || showCascade ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Resolving...</>
            ) : hasNoVendors ? (
              <>No vendors to update</>
            ) : (
              <><Zap size={16} className="mr-2 text-saffron-light" /> Resolve with Option {selectedKey}</>
            )}
          </Button>
          
          {hasNoVendors && !resolved && (
            <p className="mt-2 text-center text-[10px] text-ink-muted">
              All vendors have been removed. Nothing to update.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
// =============================================================================
// COMPLETE COMPONENT
// =============================================================================

function Complete({ resolved, resolutionKey, vendors, destination, routePlan }: { 
  resolved: boolean; 
  resolutionKey: string;
  vendors: VendorConfirmation[];
  destination: string;
  routePlan: RoutePlan;
}) {
  const resolutionMessages = {
    A: {
      title: "Ripple Engine preserved the day",
      detail: "Outdoor trek swapped for an indoor gallery. All affected partners notified."
    },
    B: {
      title: "Ripple Engine moved the weather risk",
      detail: "Outdoor trek moved to Day 3 and the driver buffer stayed protected."
    },
    C: {
      title: "Ripple Engine closed the affected booking",
      detail: "The trek was cancelled, a vendor credit was logged, and the rest of the route stayed intact."
    }
  };
  
  const msg = resolutionMessages[resolutionKey as keyof typeof resolutionMessages] || resolutionMessages.A;
  const bookingRef = `TRP-${String(8000 + Math.floor(Math.random() * 1000))}`;
  const travelDate = format(new Date(), "dd MMM yyyy");
  const allConfirmed = vendors.every(v => v.status === 'confirmed');
  
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-moss/10 px-4 py-2 text-xs font-bold text-moss">
          <CheckCircle2 size={16} /> Trip Confirmed
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tighter">
          Your journey is <em className="text-teal">ready.</em>
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Booking #{bookingRef} · Confirmed on {travelDate}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-teal/20 bg-white shadow-[0_18px_50px_rgba(23,34,35,0.12)]">
        <div className="absolute left-0 right-0 top-1/2 z-0 flex -translate-y-1/2 justify-between px-2 opacity-20">
          <div className="flex w-full justify-between">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="h-3 w-0.5 rounded-full bg-ink/40" />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.4fr_1fr]">
          <div className="border-b border-ink/10 p-6 md:border-b-0 md:border-r md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo variant="tiny" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">Orbit</span>
              </div>
              <Badge className="bg-teal/10 text-teal hover:bg-teal/20">
                <Check size={12} className="mr-1" /> Confirmed
              </Badge>
            </div>

            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tighter">
              {destination}
            </h2>
            <p className="text-xs text-ink-muted">{routePlan.distance} · {routePlan.driveTime}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Traveler</p>
                <p className="mt-1 text-sm font-bold">Aanya Sharma</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Dates</p>
                <p className="mt-1 text-sm font-bold">12–14 Feb 2026</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-paper/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Vendor Confirmations</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {vendors.map((vendor) => {
                  const Icon = vendor.icon;
                  const isConfirmed = vendor.status === 'confirmed';
                  return (
                    <div key={vendor.id} className="flex items-center gap-1.5 text-xs">
                      <Icon size={12} className={isConfirmed ? "text-moss" : "text-ink-muted"} />
                      <span className="flex-1 truncate text-ink">{vendor.name}</span>
                      <span className={cn("text-[8px] font-bold", isConfirmed ? "text-moss" : "text-amber")}>
                        {isConfirmed ? "✓" : "⏳"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-ink/8 pt-4">
              <span className="text-xs text-ink-muted">Total paid</span>
              <span className="font-display text-2xl font-bold tracking-tighter">₹49,240</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 p-6 md:p-8">
            <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white shadow-sm border border-ink/8">
              <QrCode size={64} className="text-ink/60" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Scan for trip details</p>
            
            <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
              <Button 
                onClick={() => toast.success("Ticket saved to device")}
                className="flex-1 h-10 rounded-xl bg-teal text-xs font-bold text-white hover:bg-teal-dark"
              >
                <Download size={14} className="mr-2" /> Save Ticket
              </Button>
              <Button 
                onClick={() => { navigator.clipboard?.writeText(`Booking #${bookingRef}`); toast.success("Booking reference copied"); }}
                variant="outline"
                className="flex-1 h-10 rounded-xl border-ink/12 text-xs font-bold text-ink hover:bg-paper-dark"
              >
                <Copy size={14} className="mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-dashed border-ink/15 px-6 py-3 text-center md:px-8">
          <p className="text-[10px] text-ink-muted/60">
            <LockKeyhole size={12} className="inline mr-1.5" />
            Privacy protected · Vendor contacts are masked
          </p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-ink/8 px-6 py-4">
          <h3 className="font-display text-lg font-semibold tracking-tighter">Your Itinerary</h3>
        </div>
        <div className="divide-y divide-ink/8">
          {[
            { day: "Day 1 · 12 Feb", activities: ["Home pickup · 07:30", "Drive to Jaipur", "Hotel check-in · 17:30"] },
            { day: "Day 2 · 13 Feb", activities: ["Amber Fort tour", "Local food experience", "Evening at leisure"] },
            { day: "Day 3 · 14 Feb", activities: ["Morning yoga", "Departure"] },
          ].map((day, index) => (
            <div key={index} className="px-6 py-4">
              <p className="text-xs font-bold text-teal">{day.day}</p>
              <ul className="mt-2 space-y-1.5">
                {day.activities.map((activity, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink/70">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal/30 shrink-0" />
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {resolved && (
        <Card className="border-amber/20 bg-amber/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/20 text-amber-dark">
              <Zap size={17} />
            </div>
            <div>
              <MiniLabel tone="amber">Ripple Engine</MiniLabel>
              <p className="mt-1 text-sm font-bold text-ink">{msg.title}</p>
              <p className="mt-1 text-xs text-ink-muted">{msg.detail}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="border-teal/15 bg-teal/5 p-5">
        <div className="flex items-start gap-3">
          <Phone size={18} className="text-teal shrink-0" />
          <div>
            <MiniLabel tone="teal">24/7 Support</MiniLabel>
            <p className="mt-1 text-sm font-bold text-ink">+91 98765 43210</p>
            <p className="mt-1 text-xs text-ink-muted">Emergency assistance · Route support · Vendor coordination</p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button 
          onClick={() => toast.success("Trip details emailed")}
          className="flex-1 h-12 rounded-xl bg-teal font-bold text-white hover:bg-teal-dark"
        >
          <Send size={16} className="mr-2" /> Email Trip Details
        </Button>
        <Button 
          onClick={() => toast.success("Feedback form opened")}
          variant="outline"
          className="flex-1 h-12 rounded-xl border-ink/12 font-bold text-ink hover:bg-paper-dark"
        >
          <Star size={16} className="mr-2" /> Leave Review
        </Button>
        <Button 
          onClick={() => window.location.reload()}
          variant="ghost"
          className="h-12 rounded-xl font-bold text-ink-muted hover:bg-paper-dark"
        >
          <RefreshCw size={16} className="mr-2" /> Start New Trip
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// OPERATOR DASHBOARD
// =============================================================================

function OperatorDashboard({ resolved, onResolve, vendors }: { resolved: boolean; onResolve: () => void; vendors: VendorConfirmation[] }) {
  const [showRipple, setShowRipple] = useState(false);
  const alertState = resolved ? "Resolved" : "Needs action";
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const confirmedVendors = vendors.filter(v => v.status === 'confirmed');
  
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <MiniLabel tone="teal">Operator Command Center</MiniLabel>
          <h1>See the whole route. <em>Move one thing.</em></h1>
          <p>A calm control surface for active trips, vendor health, margins, and the next operational risk.</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip tone="green">12 active trips</StatusChip>
          <StatusChip tone={resolved ? "green" : "amber"}>
            {resolved ? "All clear" : `${pendingVendors.length} vendor${pendingVendors.length > 1 ? 's' : ''} pending`}
          </StatusChip>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active trips" value="12" sub="+3 from yesterday" icon={Navigation} tone="teal" />
        <Metric label="Live margin" value="18.4%" sub="₹86,420 protected" icon={TrendingUp} tone="green" />
        <Metric label="Vendor response" value={`${Math.round((confirmedVendors.length / vendors.length) * 100)}%`} sub={`${confirmedVendors.length}/${vendors.length} confirmed`} icon={MessageCircle} tone="saffron" />
        <Metric label="Open risks" value={resolved ? "0" : "01"} sub={resolved ? "Route stable" : "Rain · Day 2"} icon={CircleAlert} tone={resolved ? "green" : "amber"} />
      </div>
      
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
            <div>
              <MiniLabel>Live fleet map</MiniLabel>
              <p className="mt-2 text-sm font-bold text-ink">Active groups · North Rajasthan</p>
            </div>
            <button type="button" onClick={() => toast.info("Full fleet map opened in visual preview")} className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-xs font-bold text-ink-muted">
              <MapPin size={13} /> Full map <ChevronDown size={13} />
            </button>
          </div>
          <div className="relative h-97.5 overflow-hidden bg-[#cbd9d3]">
            <img src={mapImage} alt="Operational live fleet map" className="absolute inset-0 h-full w-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-ink/5" />
            <div className="operator-marker left-[18%] top-[70%]">
              <span className="h-3 w-3 rounded-full bg-teal shadow-[0_0_0_5px_rgba(13,148,136,0.18)]" />
              <span>TRP-8029 · on route</span>
            </div>
            <div className="operator-marker left-[55%] top-[43%]">
              <span className="h-3 w-3 rounded-full bg-amber shadow-[0_0_0_5px_rgba(217,119,6,0.16)]" />
              <span>TRP-8018 · weather watch</span>
            </div>
            <div className="operator-marker left-[72%] top-[24%]">
              <span className="h-3 w-3 rounded-full bg-moss shadow-[0_0_0_5px_rgba(77,124,75,0.16)]" />
              <span>TRP-8004 · stable</span>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2 rounded-xl border border-paper/60 bg-paper/88 px-3 py-2 text-[10px] font-bold text-ink shadow-sm backdrop-blur-md">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal" /> Active</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber" /> Watch</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-moss" /> Stable</span>
            </div>
          </div>
        </Card>
        
        <div className="space-y-5">
          <Card className={cn("p-5", resolved ? "border-moss/20 bg-moss/5" : "border-amber/20 bg-amber/5")}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", resolved ? "bg-moss/12 text-moss" : "bg-amber text-ink")}>
                  {resolved ? <CheckCircle2 size={17} /> : <CloudRain size={17} />}
                </span>
                <div>
                  <MiniLabel tone={resolved ? "green" : "amber"}>Predictive threat matrix</MiniLabel>
                  <p className="mt-1 text-sm font-bold text-ink">{resolved ? "Weather ripple resolved" : "Heavy rain · Day 2"}</p>
                </div>
              </div>
              <StatusChip tone={resolved ? "green" : "amber"}>{alertState}</StatusChip>
            </div>
            
            <p className="mt-5 text-sm leading-6 text-ink/72">
              {resolved 
                ? "Indoor Art Gallery substitution cascaded to traveler, driver, hotel, guide, and vendor views." 
                : "Outdoor trek at risk at 2:00 PM. Four connected bookings need a coordinated answer."}
            </p>
            
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-paper/70 p-3">
                <span className="text-ink-muted">Traveler</span>
                <strong className="mt-1 block">Aanya Sharma</strong>
              </div>
              <div className="rounded-xl bg-paper/70 p-3">
                <span className="text-ink-muted">Impact</span>
                <strong className="mt-1 block">4 vendors</strong>
              </div>
            </div>
            
            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-ink-muted">Vendor Status</p>
              {vendors.map((vendor) => {
                const Icon = vendor.icon;
                const isConfirmed = vendor.status === 'confirmed';
                return (
                  <div key={vendor.id} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Icon size={12} /> {vendor.name}
                    </span>
                    <span className={cn("font-bold", isConfirmed ? "text-moss" : "text-amber")}>
                      {isConfirmed ? "✓ Confirmed" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {!resolved && (
              <Button onClick={() => setShowRipple(true)} className="mt-5 h-11 w-full rounded-xl bg-ink font-bold text-paper hover:bg-ink/90">
                <Zap size={15} className="mr-2 text-saffron-light" /> Open Ripple Engine
              </Button>
            )}
            
            {resolved && (
              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-moss">
                <CheckCircle2 size={15} /> Cascade complete · 00:01:42
              </div>
            )}
          </Card>
          
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <MiniLabel>Dispatch activity</MiniLabel>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Now</span>
            </div>
            <div className="mt-5 space-y-4">
              {[
                { icon: MessageCircle, title: "Vendor confirmed", detail: "Customer #TRV-8029", tone: "teal" },
                { icon: Bike, title: resolved ? "Driver route updated" : "Driver route stable", detail: resolved ? "New stop · Gallery District" : "TRP-8029 · 12 mins ahead", tone: resolved ? "green" : "saffron" },
                { icon: ShieldCheck, title: "Privacy relay active", detail: "No traveler contact exposed", tone: "green" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", item.tone === "teal" ? "bg-teal/10 text-teal" : item.tone === "saffron" ? "bg-saffron/12 text-saffron" : "bg-moss/10 text-moss")}>
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{item.title}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      
      {showRipple && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="flex items-start justify-between border-b border-ink/8 p-6">
              <div>
                <MiniLabel tone="amber">Ripple Engine · TRP-8029</MiniLabel>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">Resolve the rain ripple</h2>
                <p className="mt-2 text-sm text-ink-muted">The graph found three safe paths for Aanya's Day 2.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setShowRipple(false)}><X size={16} /></button>
            </div>
            
            <div className="space-y-3 p-6">
              {[
                { label: "A", title: "Swap for Indoor Art Gallery", detail: "Best preference match · ₹0 delta", tone: "teal" },
                { label: "B", title: "Reschedule trek to Day 3", detail: "Adds 45 minutes to final day · +₹400", tone: "neutral" },
                { label: "C", title: "Issue instant refund credit", detail: "Preserve route · −₹1,800", tone: "neutral" }
              ].map((option) => (
                <button 
                  key={option.label} 
                  type="button" 
                  onClick={option.label === "A" ? () => { onResolve(); setShowRipple(false); } : () => toast.info(`${option.title} selected for visual comparison`)} 
                  className={cn("ripple-modal-option", option.tone === "teal" && "ripple-modal-option-active")}
                >
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold", option.tone === "teal" ? "bg-teal text-white" : "bg-ink/7 text-ink-muted")}>
                    {option.label}
                  </span>
                  <span className="flex-1 text-left">
                    <strong className="block text-sm text-ink">{option.title}</strong>
                    <small className="mt-1 block text-xs text-ink-muted">{option.detail}</small>
                  </span>
                  {option.tone === "teal" ? (
                    <span className="rounded-full bg-teal/10 px-2 py-1 text-[10px] font-bold text-teal">Recommended</span>
                  ) : (
                    <ArrowRight size={15} className="text-ink-muted" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between border-t border-ink/8 bg-paper-dark px-6 py-4">
              <span className="text-xs text-ink-muted">Updates 5 connected surfaces</span>
              <Button onClick={() => { onResolve(); setShowRipple(false); }} className="h-10 rounded-xl bg-ink px-4 text-xs font-bold text-paper hover:bg-ink/90">
                Resolve cascade <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// VENDOR VIEW
// =============================================================================

function VendorView({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  const [declined, setDeclined] = useState(false);
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="section-heading">
        <MiniLabel tone="teal">Vendor Micro-Swarm</MiniLabel>
        <h1>No new app. <em>Just the next clear action.</em></h1>
        <p>A privacy-safe WhatsApp bridge lets local partners confirm schedules without seeing a traveler's private number.</p>
      </div>
      
      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <Card className="vendor-phone-wrap">
          <div className="vendor-phone">
            <div className="phone-notch" />
            
            <div className="flex items-center gap-3 border-b border-ink/8 bg-paper px-4 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                <Store size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">Local Store</p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-moss">
                  <span className="h-1.5 w-1.5 rounded-full bg-moss" /> WhatsApp business
                </p>
              </div>
              <MoreHorizontal size={17} className="text-ink-muted" />
            </div>
            
            <div className="flex-1 space-y-4 bg-[#e9efe9] p-4">
              <div className="mx-auto w-fit rounded-full bg-paper/70 px-3 py-1 text-[10px] font-bold text-ink-muted">
                Today · Privacy Relay
              </div>
              
              <div className="chat-bubble chat-bubble-in">
                <p className="text-xs leading-5 text-ink">
                  New order request from <strong>Customer #TRV-8029</strong>:<br /><br />
                  <strong>Items ready for pickup</strong><br />
                  Arrival in 15 mins<br />
                  System fixed rate: <strong>₹120</strong>
                </p>
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-teal/8 px-2 py-2 text-[10px] font-bold text-teal">
                  <LockKeyhole size={12} /> Traveler number hidden
                </div>
                <span className="mt-2 block text-[10px] text-ink-muted">11:42 AM · delivered</span>
              </div>
              
              {confirmed ? (
                <div className="chat-bubble chat-bubble-out">
                  <p className="text-xs leading-5 text-ink">Confirmed. We'll have it ready.</p>
                  <span className="mt-2 block text-[10px] text-ink-muted">11:43 AM · seen</span>
                </div>
              ) : declined ? (
                <div className="chat-bubble chat-bubble-out">
                  <p className="text-xs leading-5 text-ink">Can't fulfil this request today.</p>
                  <span className="mt-2 block text-[10px] text-ink-muted">11:43 AM · sent</span>
                  <button type="button" onClick={() => setDeclined(false)} className="mt-3 text-[10px] font-bold text-teal">
                    Reopen request
                  </button>
                </div>
              ) : (
                <div className="chat-bubble chat-bubble-in">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/12 text-saffron">
                      <TicketCheck size={15} />
                    </span>
                    <div>
                      <strong className="block text-xs text-ink">Digital QR Voucher</strong>
                      <span className="text-[10px] text-ink-muted">Fixed menu rate · ₹120</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={onConfirm} className="flex-1 rounded-lg bg-moss px-3 py-2 text-[10px] font-bold text-white">
                      Confirm
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { 
                        setDeclined(true); 
                        toast.info("Decline logged · operator notified"); 
                      }} 
                      className="flex-1 rounded-lg border border-ink/10 bg-paper px-3 py-2 text-[10px] font-bold text-ink-muted"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t border-ink/8 bg-paper px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl bg-paper-dark px-3 py-2 text-xs text-ink-muted">
                <span className="flex-1">Message</span>
                <Send size={14} className="text-teal" />
              </div>
            </div>
          </div>
        </Card>
        
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <MiniLabel tone="teal">Privacy-preserving bridge</MiniLabel>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">The relay keeps trust visible.</h2>
              </div>
              <ShieldCheck size={23} className="text-teal" />
            </div>
            
            <div className="mt-6 space-y-3">
              {[
                { icon: LockKeyhole, title: "Anonymized proxy ID", copy: "Customer #TRV-8029 replaces personal details." },
                { icon: IndianRupee, title: "Fixed transparent rate", copy: "₹120 is attached to the voucher before arrival." },
                { icon: Activity, title: "Operator audit log", copy: confirmed ? "Confirmed · 11:43 AM · response time 1m" : "Waiting for vendor confirmation · alert at 10m" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl bg-paper-dark p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-ink">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">{item.copy}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          
          <Card className={cn("p-6", confirmed ? "border-moss/20 bg-moss/5" : "border-saffron/18 bg-saffron/5")}>
            <div className="flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", confirmed ? "bg-moss/12 text-moss" : "bg-saffron/12 text-saffron")}>
                {confirmed ? <CheckCircle2 size={18} /> : <Timer size={18} />}
              </div>
              <div>
                <MiniLabel tone={confirmed ? "green" : "saffron"}>Command center sync</MiniLabel>
                <p className="mt-1 text-sm font-bold text-ink">{confirmed ? "Traveler pass updated" : "Confirmation pending"}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-ink-muted">
              <span className={cn("h-2 w-2 rounded-full", confirmed ? "bg-moss" : "bg-saffron")} />
              {confirmed ? "Logged without exposing personal data" : "No phone number or full name shown"}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN HOME COMPONENT
// =============================================================================

export default function Home() {
  const [mode, setMode] = useState<Mode>("traveler");
  const [step, setStep] = useState<TravelerStep>(0);
  const [destination, setDestination] = useState("Jaipur, Rajasthan");
  const routePlan = useMemo(() => createRoutePlan(destination), [destination]);

  const [budget, setBudget] = useState([50000]);
  const [dates, setDates] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [pickupMode, setPickupMode] = useState<PickupMode>("home");
  const [pickupAddress, setPickupAddress] = useState("");
  const [styles, setStyles] = useState(["Local Street Food", "Culture & History"]);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);

  const [addedStop, setAddedStop] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [poiChatOpen, setPoiChatOpen] = useState(false);
  const [addedPOIs, setAddedPOIs] = useState<POI[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatTyping, setChatTyping] = useState(false);
  
  const [tripTotal, setTripTotal] = useState(BASE_TRIP_PRICE);
  const [upgraded, setUpgraded] = useState(false);
  const [vendorConfirmed, setVendorConfirmed] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [resolutionKey, setResolutionKey] = useState("A");
  const [isConfirmingAll, setIsConfirmingAll] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentConfirmation, setPaymentConfirmation] = useState<PaymentConfirmation | null>(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);

  const [vendors, setVendors] = useState<VendorConfirmation[]>([
    { id: 'hotel', name: 'Kesar Bagh Haveli', type: 'hotel', icon: Hotel, status: 'pending', price: 14200 },
    { id: 'driver', name: 'Driver · Rajesh K.', type: 'driver', icon: Car, status: 'pending', price: 18400 },
    { id: 'guide', name: 'Amber Fort Guide', type: 'guide', icon: Compass, status: 'pending', price: 2800 },
    { id: 'vendor', name: 'Sharma Ji Samosa Hub', type: 'vendor', icon: Store, status: 'pending', price: 120 },
    { id: 'activity', name: 'Local Food Experience', type: 'activity', icon: UsersRound, status: 'pending', price: 3500 },
  ]);

  useEffect(() => {
    const poiTotal = addedPOIs.reduce((sum, p) => sum + p.detourCost, 0);
    const baseWithStop = BASE_TRIP_PRICE + (addedStop ? LOCAL_STOP_PRICE : 0);
    setTripTotal(baseWithStop + poiTotal);
  }, [addedPOIs, addedStop]);

  const addLocalStop = () => {
    if (addedStop) return;
    setAddedStop(true);
    toast.success("Local stop added to route · +₹240");
  };

  const handleConfirmVendor = (id: string) => {
    setVendors(prev => prev.map(v => 
      v.id === id && v.status === 'pending' 
        ? { ...v, status: 'confirming' } 
        : v
    ));
    
    setTimeout(() => {
      setVendors(prev => prev.map(v => 
        v.id === id && v.status === 'confirming'
          ? { ...v, status: 'confirmed' }
          : v
      ));
      toast.success(`${vendors.find(v => v.id === id)?.name} confirmed!`);
    }, 800 + Math.random() * 600);
  };

  const handleConfirmAll = () => {
    setIsConfirmingAll(true);
    const pendingVendors = vendors.filter(v => v.status === 'pending');
    
    pendingVendors.forEach((vendor, index) => {
      setTimeout(() => {
        handleConfirmVendor(vendor.id);
      }, index * 600 + 300);
    });
    
    setTimeout(() => {
      setIsConfirmingAll(false);
      toast.success("All vendors confirmed!");
    }, pendingVendors.length * 600 + 1000);
  };

  const handleResolve = (key: string) => {
  setIsResolving(true);
  setResolutionKey(key);
  
  // Faster: 1500ms instead of 3000ms
  setTimeout(() => {
    setVendors(prev => prev.map(v => ({ ...v, status: 'confirmed' })));
    setResolved(true);
    setIsResolving(false);
    setStep(6);
    toast.success(`Ripple resolved with Option ${key}!`);
  }, 1500);
};
  const handlePay = () => {
    if (!selectedPaymentMethod) return;
    
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      const confirmation: PaymentConfirmation = {
        method: selectedPaymentMethod,
        timestamp: new Date().toISOString(),
        transactionId: `TRP-${String(8000 + Math.floor(Math.random() * 1000))}`,
        amount: tripTotal,
        status: 'completed'
      };
      
      setPaymentConfirmation(confirmation);
      setShowPaymentConfirmation(true);
      setIsProcessingPayment(false);
      toast.success("Payment successful! Your trip is confirmed.");
    }, 2000);
  };

  const modeMeta = useMemo(() => ({
    traveler: { eyebrow: "Traveler workspace", title: "A trip that listens back.", copy: "Follow the visual journey from the traveler's first preference to a live, adaptable pass." },
    operator: { eyebrow: "Operations workspace", title: "Every dependency, in view.", copy: "See how one operational decision ripples across the traveler, vendors, and the route." },
    vendor: { eyebrow: "Vendor workspace", title: "The local layer, connected.", copy: "Show how a shopkeeper confirms a fixed-rate request without installing a new app or seeing private data." },
  }), []);

  const restart = () => {
    setMode("traveler");
    setStep(0);
    setDestination("Jaipur, Rajasthan");
    setBudget([50000]);
    setDates("");
    setDurationDays(3);
    setPickupMode("home");
    setPickupAddress("");
    setStyles(["Local Street Food", "Culture & History"]);
    setAddedStop(false);
    setAddedPOIs([]);
    setSelectedPOI(null);
    setPoiChatOpen(false);
    setChatMessages([]);
    setChatTyping(false);
    setTripTotal(BASE_TRIP_PRICE);
    setUpgraded(false);
    setVendorConfirmed(false);
    setResolved(false);
    setResolutionKey("A");
    setAdults(2);
    setChildrenCount(0);
    setInfants(0);
    setSelectedPaymentMethod(null);
    setIsProcessingPayment(false);
    setPaymentConfirmation(null);
    setShowPaymentConfirmation(false);
    setVendors([
      { id: 'hotel', name: 'Kesar Bagh Haveli', type: 'hotel', icon: Hotel, status: 'pending', price: 14200 },
      { id: 'driver', name: 'Driver · Rajesh K.', type: 'driver', icon: Car, status: 'pending', price: 18400 },
      { id: 'guide', name: 'Amber Fort Guide', type: 'guide', icon: Compass, status: 'pending', price: 2800 },
      { id: 'vendor', name: 'Sharma Ji Samosa Hub', type: 'vendor', icon: Store, status: 'pending', price: 120 },
      { id: 'activity', name: 'Local Food Experience', type: 'activity', icon: UsersRound, status: 'pending', price: 3500 },
    ]);
    setIsConfirmingAll(false);
    setIsResolving(false);
  };
  
  const openAdapt = () => setStep(5);

  // =============================================================================
  // TRAVELER VIEW RENDER
  // =============================================================================

  const renderTravelerView = () => {
    switch (step) {
      case 0:
        return (
          <IntakeCanvas
            destination={destination}
            setDestination={setDestination}
            routePlan={routePlan}
            budget={budget}
            setBudget={setBudget}
            dates={dates}
            setDates={setDates}
            durationDays={durationDays}
            setDurationDays={setDurationDays}
            pickupMode={pickupMode}
            setPickupMode={setPickupMode}
            pickupAddress={pickupAddress}
            setPickupAddress={setPickupAddress}
            styles={styles}
            setStyles={setStyles}
            adults={adults}
            setAdults={setAdults}
            childrenCount={childrenCount}
            setChildrenCount={setChildrenCount}
            infants={infants}
            setInfants={setInfants}
            onBuild={() => setStep(1)}
            onDestinationClick={(dest) => setDestination(dest)}
          />
        );
      case 1:
        return (
          <div className="space-y-8 animate-fade-up">
            <div className="section-heading flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <MiniLabel tone="teal">02 / Route Radar</MiniLabel>
                <h1>Your route with <em>optional discoveries.</em></h1>
                <p>The main route stays clear. Click any POI to explore if it's worth the detour.</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip tone="green">Route ready</StatusChip>
                <StatusChip tone="teal">{addedPOIs.length > 0 ? `${addedPOIs.length} stop${addedPOIs.length > 1 ? 's' : ''} added` : 'Tap POIs to explore'}</StatusChip>
              </div>
            </div>
            
            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
              <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-ink/8 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/10 text-teal">
                      <Route size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {routePlan.origin} → {routePlan.destination}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {routePlan.distance} · {routePlan.driveTime} · {addedPOIs.length > 0 ? `${addedPOIs.length} detour${addedPOIs.length > 1 ? 's' : ''}` : 'Direct route'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((day) => (
                      <button 
                        key={day} 
                        type="button" 
                        onClick={() => { 
                          toast.success(`Day ${day} route loaded`); 
                        }} 
                        className={cn("day-tab", day === 1 && "day-tab-active")}
                      >
                        Day {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="relative h-112.5 overflow-hidden bg-[#cbd9d3]">
                  <RouteRadarMap 
                    destination={destination}
                    originLabel={routePlan.origin}
                    onPOIClick={(poi) => {
                      setSelectedPOI(poi);
                      setPoiChatOpen(true);
                      setChatMessages([{
                        id: `assistant-${Date.now()}`,
                        role: "assistant",
                        text: `👋 Hi! I'm your AI assistant for ${poi.name}. ${poi.description} The detour takes ${poi.detourTime} and costs ₹${poi.detourCost}. Would you like to add it to your route?`
                      }]);
                    }}
                    selectedPOI={selectedPOI}
                    addedPOIs={addedPOIs}
                  />
                  
                  <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-paper/50 bg-paper/88 px-3 py-2 shadow-sm backdrop-blur-md">
                    <p className="eyebrow text-teal">Route • Google Maps style</p>
                    <p className="mt-1 text-xs font-semibold text-ink">
                      {addedPOIs.length > 0 ? `${addedPOIs.length} stop${addedPOIs.length > 1 ? 's' : ''} added` : 'Tap any POI to explore'}
                    </p>
                  </div>
                </div>
              </Card>
              
              <div className="space-y-5">
                {poiChatOpen && selectedPOI ? (
                  <Card className="border-teal/12 bg-teal/5 p-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                        <div>
                          <MiniLabel tone="teal">Route waypoint · AI Assistant</MiniLabel>
                          <h3 className="mt-1 flex items-center gap-2 font-display text-xl font-semibold tracking-tighter">
                            <span>{selectedPOI.icon}</span>
                            {selectedPOI.name}
                          </h3>
                        </div>
                        <button type="button" className="icon-button" onClick={() => { setPoiChatOpen(false); setSelectedPOI(null); }}>
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between border-b border-ink/8 pb-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                          <Star size={14} fill="currentColor" className="text-saffron" /> 
                          {selectedPOI.rating} · {selectedPOI.detourTime} detour
                        </span>
                        <span className="text-xs font-semibold text-moss">
                          {selectedPOI.hours || 'Open today'}
                        </span>
                      </div>
                      
                      <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
                        {chatMessages.map((message) => (
                          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                            {message.role === "assistant" && (
                              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal text-white">
                                <Bot size={15} />
                              </div>
                            )}
                            <div className={cn(
                              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-5",
                              message.role === "user" 
                                ? "bg-teal text-white" 
                                : "bg-teal/8 text-ink"
                            )}>
                              {message.text}
                            </div>
                          </div>
                        ))}
                        {chatTyping && (
                          <div className="flex justify-start">
                            <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal text-white">
                              <Bot size={15} />
                            </div>
                            <div className="flex items-center gap-1 rounded-2xl bg-teal/8 px-4 py-3">
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal [animation-delay:-0.2s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal [animation-delay:-0.1s]" />
                              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal" />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-ink/10 pt-4">
                        <div className="field-shell mb-3">
  <input 
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        const target = e.target as HTMLInputElement;
        const msg = target.value;
        if (!msg.trim()) return;
        
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          text: msg
        };
        const updatedMessages = [...chatMessages, userMessage];
        setChatMessages(updatedMessages);
        setChatTyping(true);
        setTimeout(() => {
          const response = `I'd be happy to help with ${selectedPOI.name}! ${selectedPOI.description} The detour takes ${selectedPOI.detourTime} and costs ₹${selectedPOI.detourCost}. Would you like to add it to your route?`;
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            text: response
          };
          setChatMessages([...updatedMessages, assistantMessage]);
          setChatTyping(false);
        }, 800 + Math.random() * 600);
        target.value = "";
      }
    }}
    placeholder={`Ask about ${selectedPOI.name}...`}
    aria-label="Chat message"
    disabled={chatTyping}
    className="flex-1 bg-transparent outline-none"
  />
  <button 
    type="button" 
    className="icon-button h-8 w-8 shrink-0"
    disabled={chatTyping}
    aria-label="Send message"
  >
    <Send size={14} className="text-teal" />
  </button>
</div>
                        <Button 
                          onClick={() => {
                            if (addedPOIs.some(p => p.id === selectedPOI.id)) return;
                            setAddedPOIs([...addedPOIs, selectedPOI]);
                            setPoiChatOpen(false);
                            setSelectedPOI(null);
                            toast.success(`${selectedPOI.name} added to route! +₹${selectedPOI.detourCost}`);
                          }} 
                          className={cn(
                            "h-11 w-full rounded-xl font-bold",
                            addedPOIs.some(p => p.id === selectedPOI.id)
                              ? "bg-moss text-white hover:bg-moss" 
                              : "bg-teal text-white hover:bg-teal-dark"
                          )}
                          disabled={addedPOIs.some(p => p.id === selectedPOI.id)}
                        >
                          {addedPOIs.some(p => p.id === selectedPOI.id) ? (
                            <><Check size={16} className="mr-2" /> Added to route</>
                          ) : (
                            <><Plus size={16} className="mr-2" /> Add to route · ₹{selectedPOI.detourCost}</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="border-teal/12 bg-teal/5 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal text-white">
                        <Bot size={17} />
                      </div>
                      <div>
                        <MiniLabel tone="teal">Contextual assistant</MiniLabel>
                        <p className="mt-2 text-sm font-semibold leading-5 text-ink">
                          {addedPOIs.length > 0 
                            ? `You've added ${addedPOIs.length} stop${addedPOIs.length > 1 ? 's' : ''}. Want to explore more along the way?` 
                            : "Click any POI on the map to learn more about it. I'll help you decide!"}
                        </p>
                        {addedPOIs.length === 0 && (
                          <button 
                            type="button" 
                            onClick={() => toast.info("Tap a POI marker on the map to start exploring!")} 
                            className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal"
                          >
                            Explore nearby stops <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
                
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <MiniLabel>Daily timeline</MiniLabel>
                      <p className="mt-2 text-sm font-bold text-ink">Friday · 12 February</p>
                    </div>
                    <button type="button" onClick={() => toast.info("Timeline options")} className="icon-button">
                      <MoreHorizontal size={17} />
                    </button>
                  </div>
                  
                  <div className="mt-6 space-y-0">
                    <div className="timeline-row">
                      <div className="timeline-icon bg-teal/10 text-teal">
                        <HomeIcon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-ink">Home pickup</p>
                          <span className="text-[10px] font-bold text-ink-muted">07:30</span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-ink-muted">Driver · Rajesh K.</p>
                      </div>
                      <div className="timeline-connector" />
                    </div>
                    
                    {addedPOIs.map((poi, index) => (
                      <div key={poi.id} className="timeline-row">
                        <div className="timeline-icon bg-saffron/12 text-saffron">
                          <span className="text-sm">{poi.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-bold text-ink">{poi.name}</p>
                            <span className="text-[10px] font-bold text-ink-muted">
                              {`${9 + index * 2}:${index === 0 ? '40' : '20'}`}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[11px] text-ink-muted">
                            {poi.detourTime} · ₹{poi.detourCost}
                          </p>
                        </div>
                        {index < addedPOIs.length - 1 && <div className="timeline-connector" />}
                      </div>
                    ))}
                    
                    <div className="timeline-row">
                      <div className="timeline-icon bg-saffron/12 text-saffron">
                        <Flag size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-ink">{routePlan.destination}</p>
                          <span className="text-[10px] font-bold text-ink-muted">17:30</span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-ink-muted">Arrival at destination</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            <PriceBar 
              total={`₹${tripTotal.toLocaleString("en-IN")}`} 
              delta={addedPOIs.length > 0 ? `+₹${addedPOIs.reduce((sum, p) => sum + p.detourCost, 0)} · ${addedPOIs.length} stop${addedPOIs.length > 1 ? 's' : ''} added` : "Route base price"} 
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                className="group h-11 rounded-xl bg-ink px-5 font-bold text-paper hover:bg-ink/90"
              >
                Keep shaping the trip <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        );
      case 2:
        return <EnhancedCustomization upgraded={upgraded} setUpgraded={setUpgraded} addedStop={addedStop} tripTotal={tripTotal} onNext={() => setStep(3)} />;
      case 3:
        return <Checkout 
          addedStop={addedStop} 
          upgraded={upgraded} 
          onNext={() => setStep(4)}
          vendors={vendors}
          onConfirmVendor={handleConfirmVendor}
          onConfirmAll={handleConfirmAll}
          isConfirmingAll={isConfirmingAll}
          arrivalTime="17:30"
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={setSelectedPaymentMethod}
          onPay={handlePay}
          isProcessingPayment={isProcessingPayment}
          paymentConfirmation={paymentConfirmation}
          showPaymentConfirmation={showPaymentConfirmation}
          setVendors={setVendors}
        />;
      case 4:
        return <DigitalPass 
          destination={destination} 
          onAdapt={openAdapt} 
          vendorConfirmed={vendorConfirmed}
          vendors={vendors}
          onConfirmVendor={handleConfirmVendor}
        />;
      case 5:
        return <RippleOptions 
          onResolve={handleResolve} 
          resolved={resolved} 
          isResolving={isResolving}
          vendors={vendors}
        />;
      case 6:
        return <Complete 
          resolved={resolved} 
          resolutionKey={resolutionKey}
          vendors={vendors}
          destination={destination}
          routePlan={routePlan}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Sidebar step={step} setStep={setStep} />
      <div className="lg:pl-63">
        <AppHeader mode={mode} setMode={setMode} onRestart={restart} destination={routePlan.origin} />
        <main className="main-shell mx-auto max-w-375 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="mb-8 flex items-start justify-between gap-5 lg:mb-10">
            <div>
              <p className="eyebrow text-teal">{modeMeta[mode].eyebrow}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">{modeMeta[mode].copy}</p>
            </div>
          </div>
          
          {mode === "traveler" && <ProgressRail step={step} />}
          
          {mode === "traveler" ? (
            renderTravelerView()
          ) : mode === "operator" ? (
            <OperatorDashboard 
              resolved={resolved} 
              onResolve={() => setResolved(true)} 
              vendors={vendors}
            />
          ) : (
            <VendorView confirmed={vendorConfirmed} onConfirm={() => setVendorConfirmed(true)} />
          )}
        </main>
      </div>
    </div>
  );
}