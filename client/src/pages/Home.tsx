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
  FileCheck2,
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
import { cn } from "@/lib/utils";
import { RouteRadarMap, POI } from "@/components/RouteRadarMap";
import { format } from "date-fns";

type Mode = "traveler" | "operator" | "vendor";
type TravelerStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const imageReference = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=85";
const mapImage = "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=85";
const stopImage = "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=85";

// Travel Service Options
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

// Suggested Destinations
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

type RoutePlan = {
  destination: string;
  origin: string;
  localStop: string;
  scenicStop: string;
  hotel: string;
  distance: string;
  driveTime: string;
};

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

const styleCards = [
  { label: "Local Street Food", icon: Store, color: "bg-saffron/12 text-saffron" },
  { label: "Scenic Drives", icon: Route, color: "bg-teal/12 text-teal" },
  { label: "Culture & History", icon: MapPin, color: "bg-ink/8 text-ink" },
  { label: "Thrill", icon: Bike, color: "bg-coral/12 text-coral" },
  { label: "Relaxed", icon: CoffeeIcon, color: "bg-moss/12 text-moss" },
  { label: "Adventure", icon: MountainIcon, color: "bg-amber/20 text-amber-dark" },
  { label: "Family Friendly", icon: UsersRound, color: "bg-teal/8 text-teal" },
  { label: "Romantic Getaway", icon: HeartIcon, color: "bg-coral/8 text-coral" },
  { label: "Budget Travel", icon: WalletCards, color: "bg-moss/8 text-moss" },
  { label: "Luxury", icon: Sparkles, color: "bg-saffron/8 text-saffron" },
  { label: "Spiritual", icon: Compass, color: "bg-ink/6 text-ink" },
];

function CoffeeIcon(props: React.ComponentProps<typeof Store>) {
  return <Store {...props} />;
}

function MountainIcon(props: React.ComponentProps<typeof Compass>) {
  return <Compass {...props} />;
}

function HeartIcon(props: React.ComponentProps<typeof Star>) {
  return <Star {...props} />;
}

const navItems = [
  { label: "Intake Canvas", icon: WandSparkles, step: 0 },
  { label: "Route Radar", icon: Navigation, step: 1 },
  { label: "Customize", icon: Layers3, step: 2 },
  { label: "Checkout", icon: CreditCard, step: 3 },
  { label: "Digital Pass", icon: TicketCheck, step: 4 },
  { label: "Ripple Engine", icon: Zap, step: 5 },
];

function MiniLabel({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "teal" | "amber" | "saffron" | "coral" | "green" }) {
  return (
    <span className={cn("eyebrow", tone === "teal" && "text-teal", tone === "amber" && "text-amber", tone === "saffron" && "text-saffron", tone === "coral" && "text-coral", tone === "green" && "text-moss")}>
      {children}
    </span>
  );
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

function StatusChip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "amber" | "coral" | "teal" }) {
  return <span className={cn("status-chip", `status-${tone}`)}><span className="status-dot" />{children}</span>;
}

function AppHeader({ mode, setMode, onRestart, destination }: { mode: Mode; setMode: (mode: Mode) => void; onRestart: () => void; destination: string }) {
  const [, setLocation] = useLocation();
  return (
    <header className="sticky top-0 z-40 flex h-19 items-center justify-between border-b border-ink/10 bg-paper/90 px-6 backdrop-blur-xl lg:px-9">
      <div className="flex items-center gap-3">
        <div className="brand-mark brand-mark-small">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M12 2C12 2 8 8 8 12C8 16 12 22 12 22C12 22 16 16 16 12C16 8 12 2 12 2Z" fill="white" opacity="0.3"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        </div>
        <span className="font-display text-xl font-semibold tracking-tighter text-ink">Orbit</span>
      </div>
      <div className="hidden items-center gap-3 lg:flex">
        <span className="eyebrow text-ink-muted">Live product visualization</span>
        <span className="h-1 w-1 rounded-full bg-ink-muted/50" />
        <span className="text-sm font-medium text-ink-muted">{destination} circuit · 03 day story</span>
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

function Sidebar({ step, setStep }: { step: TravelerStep; setStep: (step: TravelerStep) => void }) {
  const [, setLocation] = useLocation();
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-63 flex-col bg-ink px-5 py-6 text-paper lg:flex">
      <div className="flex items-center gap-3 px-2">
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M12 2C12 2 8 8 8 12C8 16 12 22 12 22C12 22 16 16 16 12C16 8 12 2 12 2Z" fill="white" opacity="0.3"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        </div>
        <div>
          <div className="font-display text-[22px] font-semibold tracking-tighter">Orbit</div>
          <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-paper/45">Travel OS</div>
        </div>
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

type PickupMode = "home" | "hotel" | "custom";

// Destination autocomplete using OpenStreetMap Nominatim API
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

// ============== NEW COMPONENTS ==============

// Travel Services Section
function TravelServicesSection({ onServiceClick }: { onServiceClick?: (serviceId: string) => void }) {
  return (
    <div className="mb-10">
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
                onServiceClick?.(service.id);
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
    </div>
  );
}

// Suggested Destinations Section
function SuggestedDestinationsSection({ onDestinationClick }: { onDestinationClick?: (destination: string) => void }) {
  return (
    <div className="mb-10">
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
            className="group relative overflow-hidden rounded-2xl aspect-[4/3] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-teal"
          >
            <img 
              src={destination.image} 
              alt={destination.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
            
            {/* Rating and price badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-ink/70 backdrop-blur-sm px-2.5 py-1">
              <Star size={10} className="fill-saffron text-saffron" />
              <span className="text-[10px] font-bold text-white">{destination.rating}</span>
            </div>
            
            {/* Content overlay */}
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
    </div>
  );
}

// ============== END NEW COMPONENTS ==============

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
  const basePricePerAdult = 47800;
  const pricePerChild = 25000;
  const pricePerInfant = 10000;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Travel Services Section */}
      <TravelServicesSection onServiceClick={(id) => toast.info(`${id} service opened`)} />
      
      {/* Suggested Destinations Section */}
      <SuggestedDestinationsSection onDestinationClick={onDestinationClick} />
      
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
          <img src={imageReference} alt={`Road toward ${routePlan.origin}`} className="absolute inset-0 h-full w-full object-cover opacity-80" /><div className="absolute inset-0 bg-linear-to-t from-ink via-ink/30 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-6 text-paper sm:p-8"><div className="flex items-center justify-between"><span className="rounded-full border border-paper/18 bg-ink/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-sm">Route dossier · {routePlan.destination}</span><span className="flex items-center gap-2 rounded-full bg-paper/12 px-3 py-2 text-xs font-semibold backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-teal-light" /> Season-aware</span></div><div><div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron text-ink"><Compass size={19} /></div><span className="text-sm font-medium text-paper/75">Your route will consider weather, buffers, and local character.</span></div><h2 className="max-w-md font-display text-4xl font-semibold leading-[0.98] tracking-tighter sm:text-5xl">A slower road to the <em className="text-saffron-light">good stuff.</em></h2><div className="mt-8 grid max-w-md grid-cols-3 gap-2 border-t border-paper/18 pt-5"><div><p className="text-2xl font-semibold">{durationDays}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-paper/52">Days</p></div><div><p className="text-2xl font-semibold">{nights}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-paper/52">Nights</p></div><div><p className="text-2xl font-semibold">{totalTravelers}</p><p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-paper/52">Travelers</p></div></div></div></div>
        </div>
      </div>
    </div>
  );
}

type ChatMessage = { id: string; role: "user" | "assistant"; text: string };

// =============================================================================
// POI AI Chat Functions
// =============================================================================

function getPOIAIResponse(poi: POI, userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();
  
  // Temple responses
  if (poi.type === 'temple') {
    if (lowerMsg.includes('time') || lowerMsg.includes('hour') || lowerMsg.includes('open')) {
      return `${poi.name} is open ${poi.hours || 'from early morning to evening'}. The detour takes about ${poi.detourTime}. Would you like to include this peaceful stop in your journey?`;
    }
    if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('fee') || lowerMsg.includes('₹')) {
      return `Entry to ${poi.name} is free (donations welcome). The spiritual experience is priceless! The detour adds ${poi.detourTime} to your route.`;
    }
    if (lowerMsg.includes('worth') || lowerMsg.includes('recommend') || lowerMsg.includes('should') || lowerMsg.includes('good')) {
      return `Absolutely! ${poi.name} has a ${poi.rating}★ rating from travelers. It's a beautiful, peaceful place that many find refreshing during a long journey. The detour is only ${poi.detourTime}.`;
    }
    if (lowerMsg.includes('thank')) {
      return `You're welcome! ${poi.name} would be a beautiful addition to your journey. Let me know if you'd like to add it!`;
    }
    return `🛕 ${poi.name} is a serene spiritual destination with a ${poi.rating}★ rating. The detour takes ${poi.detourTime} and entry is free. Many travelers find it a meaningful pause during their journey. Would you like to add it to your route?`;
  }
  
  // Food responses
  if (poi.type === 'food') {
    if (lowerMsg.includes('time') || lowerMsg.includes('hour') || lowerMsg.includes('open')) {
      return `${poi.name} is open ${poi.hours || 'throughout the day'}. The detour takes about ${poi.detourTime}. Perfect timing for a meal break!`;
    }
    if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('budget') || lowerMsg.includes('₹')) {
      return `A meal at ${poi.name} typically costs around ₹${poi.detourCost} per person. They have a ${poi.rating}★ rating and are known for quality food!`;
    }
    if (lowerMsg.includes('worth') || lowerMsg.includes('recommend') || lowerMsg.includes('should') || lowerMsg.includes('good')) {
      return `Highly recommended! ${poi.name} has a ${poi.rating}★ rating and is a traveler favorite. The ${poi.detourTime} detour is well worth it for the experience!`;
    }
    if (lowerMsg.includes('thank')) {
      return `You're welcome! ${poi.name} would be a great food stop. Let me know if you'd like to add it!`;
    }
    return `🍽️ ${poi.name} is a popular food destination with a ${poi.rating}★ rating. Meals cost around ₹${poi.detourCost} per person. The detour takes ${poi.detourTime}. Would you like to add this stop?`;
  }
  
  // Entertainment responses
  if (poi.type === 'entertainment') {
    if (lowerMsg.includes('time') || lowerMsg.includes('hour') || lowerMsg.includes('open')) {
      return `${poi.name} is open ${poi.hours || 'until late'}. The detour takes about ${poi.detourTime}. A fun break for the whole family!`;
    }
    if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('ticket') || lowerMsg.includes('₹')) {
      return `Entry to ${poi.name} starts at ₹${poi.detourCost} per person. They have a ${poi.rating}★ rating and offer great entertainment!`;
    }
    if (lowerMsg.includes('worth') || lowerMsg.includes('recommend') || lowerMsg.includes('should') || lowerMsg.includes('good')) {
      return `Definitely! ${poi.name} has a ${poi.rating}★ rating and offers great entertainment. The ${poi.detourTime} detour is a fun way to break up the journey!`;
    }
    if (lowerMsg.includes('thank')) {
      return `You're welcome! ${poi.name} would be a fun addition. Let me know if you'd like to add it!`;
    }
    return `🎮 ${poi.name} offers great entertainment with a ${poi.rating}★ rating. Tickets start at ₹${poi.detourCost} per person. The detour takes ${poi.detourTime}. Would you like to include it?`;
  }
  
  // Shopping responses
  if (poi.type === 'shopping') {
    if (lowerMsg.includes('time') || lowerMsg.includes('hour') || lowerMsg.includes('open')) {
      return `${poi.name} is open ${poi.hours || 'throughout the day'}. The detour takes about ${poi.detourTime} - perfect for some shopping!`;
    }
    if (lowerMsg.includes('cost') || lowerMsg.includes('price') || lowerMsg.includes('budget') || lowerMsg.includes('₹')) {
      return `${poi.name} has products for all budgets. Entry is free, and you can spend anywhere from ₹200 upwards! They have a ${poi.rating}★ rating.`;
    }
    if (lowerMsg.includes('worth') || lowerMsg.includes('recommend') || lowerMsg.includes('should') || lowerMsg.includes('good')) {
      return `Absolutely worth it! ${poi.name} has a ${poi.rating}★ rating and offers quality products. The ${poi.detourTime} detour is great for picking up local items!`;
    }
    if (lowerMsg.includes('thank')) {
      return `You're welcome! ${poi.name} would be a great shopping stop. Let me know if you'd like to add it!`;
    }
    return `🛍️ ${poi.name} is a popular shopping destination with a ${poi.rating}★ rating. The detour takes ${poi.detourTime}. Would you like to add this shopping stop?`;
  }
  
  return `I'd be happy to help with ${poi.name}! ${poi.description} The detour takes ${poi.detourTime} and costs ₹${poi.detourCost}. Would you like to add it to your route?`;
}

// =============================================================================
// POI Chat Panel Component - Replaces the drawer with a panel in the right column
// =============================================================================

function POIChatPanel({ 
  poi, 
  onClose, 
  onAdd, 
  added,
  messages,
  onSendMessage,
  typing
}: { 
  poi: POI;
  onClose: () => void;
  onAdd: () => void;
  added: boolean;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  typing: boolean;
}) {
  const [input, setInput] = useState("");
  
  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || typing) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <div>
          <MiniLabel tone="teal">Route waypoint · AI Assistant</MiniLabel>
          <h3 className="mt-1 flex items-center gap-2 font-display text-xl font-semibold tracking-tighter">
            <span>{poi.icon}</span>
            {poi.name}
          </h3>
        </div>
        <button type="button" className="icon-button" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      
      {/* POI Info */}
      <div className="flex items-center justify-between border-b border-ink/8 pb-3">
        <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
          <Star size={14} fill="currentColor" className="text-saffron" /> 
          {poi.rating} · {poi.detourTime} detour
        </span>
        <span className="text-xs font-semibold text-moss">
          {poi.hours || 'Open today'}
        </span>
      </div>
      
      {/* Chat messages */}
      <div className="max-h-56 overflow-y-auto space-y-3 pr-1">
        {messages.map((message) => (
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
        {typing && (
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
      
      {/* Input and Add button */}
      <div className="border-t border-ink/10 pt-4">
        <div className="field-shell mb-3">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Ask about ${poi.name}...`}
            aria-label="Chat message"
            disabled={typing}
          />
          <button 
            type="button" 
            onClick={handleSend} 
            className="icon-button h-8 w-8 shrink-0"
            disabled={typing}
            aria-label="Send message"
          >
            <Send size={14} className="text-teal" />
          </button>
        </div>
        <Button 
          onClick={onAdd} 
          className={cn(
            "h-11 w-full rounded-xl font-bold",
            added 
              ? "bg-moss text-white hover:bg-moss" 
              : "bg-teal text-white hover:bg-teal-dark"
          )}
          disabled={added}
        >
          {added ? (
            <><Check size={16} className="mr-2" /> Added to route</>
          ) : (
            <><Plus size={16} className="mr-2" /> Add to route · ₹{poi.detourCost}</>
          )}
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// RouteRadar Component - Updated with POI support in the contextual assistant
// =============================================================================

function RouteRadar({ 
  destination, 
  routePlan, 
  addedStop, 
  onAddStop, 
  tripTotal, 
  onNext,
  selectedPOI,
  setSelectedPOI,
  poiChatOpen,
  setPoiChatOpen,
  addedPOIs,
  setAddedPOIs,
  chatMessages,
  setChatMessages,
  chatTyping,
  setChatTyping,
}: { 
  destination: string;
  routePlan: RoutePlan;
  addedStop: boolean;
  onAddStop: () => void;
  tripTotal: number;
  onNext: () => void;
  selectedPOI: POI | null;
  setSelectedPOI: (poi: POI | null) => void;
  poiChatOpen: boolean;
  setPoiChatOpen: (open: boolean) => void;
  addedPOIs: POI[];
  setAddedPOIs: (pois: POI[]) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  chatTyping: boolean;
  setChatTyping: (typing: boolean) => void;
}) {
  const [activeDay, setActiveDay] = useState(1);
  
  // Handle POI click
  const handlePOIClick = (poi: POI) => {
    console.log("POI clicked in RouteRadar:", poi.name);
    setSelectedPOI(poi);
    setPoiChatOpen(true);
    
    // Initialize chat with welcome message
    const welcomeMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: `👋 Hi! I'm your AI assistant for ${poi.name}. ${poi.description} The detour takes ${poi.detourTime} and costs ₹${poi.detourCost}. Would you like to add it to your route?`
    };
    setChatMessages([welcomeMessage]);
  };
  
  // Handle sending message in POI chat
  const handleSendPOIMessage = (msg: string) => {
    if (!selectedPOI) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: msg
    };
    
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    
    // Simulate AI response
    setChatTyping(true);
    setTimeout(() => {
      const response = getPOIAIResponse(selectedPOI, msg);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: response
      };
      setChatMessages([...updatedMessages, assistantMessage]);
      setChatTyping(false);
    }, 800 + Math.random() * 600);
  };
  
  // Handle adding POI to route
  const handleAddPOI = (poi: POI) => {
    if (addedPOIs.some(p => p.id === poi.id)) return;
    
    setAddedPOIs([...addedPOIs, poi]);
    setPoiChatOpen(false);
    setSelectedPOI(null);
    
    toast.success(`${poi.name} added to route! +₹${poi.detourCost}`);
  };

  const allAddedCost = addedPOIs.reduce((sum, p) => sum + p.detourCost, 0);

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
                    setActiveDay(day); 
                    toast.success(`Day ${day} route loaded`); 
                  }} 
                  className={cn("day-tab", activeDay === day && "day-tab-active")}
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
              onPOIClick={handlePOIClick}
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
          {/* Contextual Assistant - Now shows POI chat when open, otherwise default state */}
          {poiChatOpen && selectedPOI ? (
            <Card className="border-teal/12 bg-teal/5 p-5">
              <POIChatPanel
                poi={selectedPOI}
                onClose={() => {
                  setPoiChatOpen(false);
                  setSelectedPOI(null);
                }}
                onAdd={() => handleAddPOI(selectedPOI)}
                added={addedPOIs.some(p => p.id === selectedPOI.id)}
                messages={chatMessages}
                onSendMessage={handleSendPOIMessage}
                typing={chatTyping}
              />
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
          
          {/* Daily timeline - stays below */}
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
              {/* Start */}
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
              
              {/* POI stops */}
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
              
              {/* Destination */}
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
        delta={addedPOIs.length > 0 ? `+₹${allAddedCost} · ${addedPOIs.length} stop${addedPOIs.length > 1 ? 's' : ''} added` : "Route base price"} 
      />
      
      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          className="group h-11 rounded-xl bg-ink px-5 font-bold text-paper hover:bg-ink/90"
        >
          Keep shaping the trip <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}

function Customization({ upgraded, setUpgraded, addedStop, tripTotal, onNext }: { upgraded: boolean; setUpgraded: (value: boolean) => void; addedStop: boolean; tripTotal: number; onNext: () => void }) {
  const grandTotal = tripTotal + (upgraded ? 1200 : 0);
  const options = [
    { type: "Heritage stay", title: "Kesar Bagh Haveli", copy: "Courtyard rooms · breakfast included", price: upgraded ? "₹14,200" : "₹13,000", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=720&q=80", selected: true },
    { type: "Activity", title: "Amber Fort at golden hour", copy: "Local guide · 45 min viewpoint buffer", price: "₹2,800", image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=720&q=80", selected: true },
    { type: "Transport", title: "Sedan + local driver", copy: "Rest windows protected · 3 days", price: "₹18,400", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=720&q=80", selected: true },
  ];
  return <div className="space-y-8 animate-fade-up"><div className="section-heading"><MiniLabel tone="teal">03 / Modular Customize</MiniLabel><h1>Make the itinerary feel <em>like yours.</em></h1><p>Swap the parts that matter. Orbit keeps the route, margin, and driver rest buffer in view.</p></div><div className="grid gap-6 xl:grid-cols-[1fr_330px]"><div className="space-y-4">{options.map((option, index) => <Card key={option.title} className="custom-option-card"><img src={option.image} alt="" className="h-28 w-36 shrink-0 rounded-xl object-cover sm:h-32 sm:w-44" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><MiniLabel tone={index === 1 ? "saffron" : "teal"}>{option.type}</MiniLabel><h3 className="mt-2 truncate font-display text-xl font-semibold tracking-tighter text-ink">{option.title}</h3><p className="mt-1 text-xs text-ink-muted">{option.copy}</p></div><span className="hidden text-sm font-bold text-ink sm:block">{option.price}</span></div><div className="mt-4 flex items-center gap-3"><StatusChip tone="green">Feasible</StatusChip><button type="button" onClick={() => toast.info(`${option.title} · ${option.copy}`)} className="text-xs font-bold text-teal hover:underline">View details</button>{index === 0 && <button type="button" onClick={() => setUpgraded(!upgraded)} className={cn("ml-auto rounded-lg border px-3 py-2 text-xs font-bold transition-colors", upgraded ? "border-teal/20 bg-teal/10 text-teal" : "border-ink/12 text-ink-muted hover:border-teal/30 hover:text-teal")}>{upgraded ? "Upgraded" : "Swap room"}</button>}</div></div></Card>)}</div><Card className="h-fit p-5 xl:sticky xl:top-28"><div className="flex items-center justify-between"><MiniLabel>Live delta pricing</MiniLabel><TrendingUp size={16} className="text-teal" /></div><div className="mt-5 rounded-2xl bg-ink p-4 text-paper"><p className="text-xs text-paper/52">Current total</p><p className="mt-1 font-display text-3xl font-semibold tracking-tighter">₹{grandTotal.toLocaleString("en-IN")}</p><p className="mt-2 text-xs font-semibold text-teal-light">{upgraded ? "+₹1,200 · room upgrade" : addedStop ? "+₹240 · local stop" : "Route base price"}</p></div><div className="mt-5 space-y-3 border-b border-ink/8 pb-5 text-xs"><div className="flex justify-between"><span className="text-ink-muted">Trip base</span><strong>₹47,800</strong></div>{addedStop && <div className="flex justify-between"><span className="text-ink-muted">Local stop</span><strong className="text-teal">+₹240</strong></div>}{upgraded && <div className="flex justify-between"><span className="text-ink-muted">Room upgrade</span><strong className="text-teal">+₹1,200</strong></div>}</div><div className="mt-5 flex items-start gap-2.5 rounded-xl bg-moss/8 p-3"><BadgeCheck size={16} className="shrink-0 text-moss" /><p className="text-xs leading-5 text-ink/70">Schedule feasible: driver rest buffer preserved.</p></div><Button onClick={onNext} className="mt-5 h-11 w-full rounded-xl bg-ink font-bold text-paper hover:bg-ink/90">Review trip <ArrowRight size={16} className="ml-2" /></Button></Card></div></div>;
}

function Checkout({ addedStop, upgraded, onNext }: { addedStop: boolean; upgraded: boolean; onNext: () => void }) {
  const checks = ["Travel distance within daily limit", "Activity timing compatible with route", "Hotel check-in time achievable", "Driver rest buffer preserved", "Vendor availability confirmed"];
  const hotelsPrice = upgraded ? 14200 : 13000;
  const transportPrice = 18400;
  const activitiesPrice = 12400;
  const servicePrice = 4000;
  const localStopPrice = addedStop ? 240 : 0;
  const grandTotal = hotelsPrice + transportPrice + activitiesPrice + servicePrice + localStopPrice;
  return <div className="space-y-8 animate-fade-up"><div className="section-heading"><MiniLabel tone="teal">04 / Single Checkout</MiniLabel><h1>Everything aligned. <em>One calm checkout.</em></h1><p>A single view of every commitment before the route becomes real.</p></div><div className="grid gap-6 xl:grid-cols-[1fr_380px]"><Card className="p-6"><div className="flex items-center justify-between border-b border-ink/8 pb-5"><div><p className="eyebrow text-ink-muted">Feasibility check</p><h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">The route is holding.</h2></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss/10 text-moss"><CheckCircle2 size={23} /></div></div><div className="mt-6 space-y-3">{checks.map((check, index) => <div key={check} className="flex items-center gap-3 rounded-xl bg-paper-dark px-4 py-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-moss/12 text-moss"><Check size={13} /></span><span className="text-sm text-ink/78">{check}</span><span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-moss">Passed</span></div>)}</div><div className="mt-8 rounded-2xl border border-saffron/20 bg-saffron/8 p-4"><div className="flex items-center gap-2"><Sparkles size={16} className="text-saffron" /><span className="text-xs font-bold text-ink">Small detail, big difference</span></div><p className="mt-2 text-sm leading-6 text-ink/72">Your local stop is locked to the route buffer. If the road changes, Orbit will recalculate downstream plans—not leave you with a stale PDF.</p></div></Card><Card className="h-fit p-6"><div className="flex items-center justify-between"><p className="eyebrow text-ink-muted">Trip ledger</p><span className="flex items-center gap-1.5 text-[11px] font-bold text-moss"><LockKeyhole size={13} /> Secure demo</span></div><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-ink-muted">Hotels · 2 nights</span><strong>₹{hotelsPrice.toLocaleString("en-IN")}</strong></div><div className="flex justify-between"><span className="text-ink-muted">Transport · 3 days</span><strong>₹{transportPrice.toLocaleString("en-IN")}</strong></div><div className="flex justify-between"><span className="text-ink-muted">Activities & guide</span><strong>₹{activitiesPrice.toLocaleString("en-IN")}</strong></div>{addedStop && <div className="flex justify-between"><span className="text-ink-muted">Local stop voucher</span><strong>₹{localStopPrice.toLocaleString("en-IN")}</strong></div>}<div className="flex justify-between"><span className="text-ink-muted">Orbit service</span><strong>₹{servicePrice.toLocaleString("en-IN")}</strong></div></div><div className="my-5 border-t border-ink/8" /><div className="flex items-end justify-between"><span className="text-sm font-bold text-ink">Trip total</span><span className="font-display text-3xl font-semibold tracking-tighter text-ink">₹{grandTotal.toLocaleString("en-IN")}</span></div><Button onClick={onNext} className="mt-6 h-12 w-full rounded-xl bg-teal font-bold text-white hover:bg-teal-dark"><CreditCard size={16} className="mr-2" /> Confirm visual booking</Button><p className="mt-3 text-center text-[11px] leading-5 text-ink-muted">Demo interaction only · no payment is processed</p></Card></div></div>;
}

function QrBlock() {
  return <div className="qr-block" aria-label="Decorative QR voucher"><div className="qr-grid">{Array.from({ length: 81 }).map((_, index) => <span key={index} className={cn("qr-cell", [0, 1, 2, 3, 9, 11, 18, 19, 20, 27, 29, 36, 37, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80].includes(index) && "qr-fill")} />)}</div></div>;
}

function DigitalPass({ destination, onAdapt, vendorConfirmed }: { destination: string; onAdapt: () => void; vendorConfirmed: boolean }) {
  return <div className="space-y-8 animate-fade-up"><div className="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><MiniLabel tone="teal">05 / Live Digital Pass</MiniLabel><h1>Your trip, <em>held together.</em></h1><p>Offline-ready details, privacy-safe local chat, and one button for the unexpected.</p></div><StatusChip tone={vendorConfirmed ? "green" : "teal"}>{vendorConfirmed ? "Vendor confirmed" : "Trip live"}</StatusChip></div><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><Card className="pass-card"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><div className="brand-mark brand-mark-tiny">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
            <path d="M12 2C12 2 8 8 8 12C8 16 12 22 12 22C12 22 16 16 16 12C16 8 12 2 12 2Z" fill="white" opacity="0.3"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
          </svg>
        </div><span className="eyebrow text-paper/55">Orbit pass</span></div><h2 className="mt-5 font-display text-4xl font-semibold leading-none tracking-tighter">{destination}, with room<br />for <em className="text-saffron-light">wonder.</em></h2></div><span className="rounded-full border border-paper/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.13em] text-paper/58">TRP · 8029</span></div><div className="mt-12 grid grid-cols-2 gap-4 border-t border-paper/15 pt-5 sm:grid-cols-4"><div><p className="eyebrow text-paper/42">Traveler</p><p className="mt-1 text-sm font-semibold">Aanya Sharma</p></div><div><p className="eyebrow text-paper/42">Dates</p><p className="mt-1 text-sm font-semibold">12–14 Feb</p></div><div><p className="eyebrow text-paper/42">Pickup</p><p className="mt-1 text-sm font-semibold">Home</p></div><div><p className="eyebrow text-paper/42">Status</p><p className="mt-1 text-sm font-semibold text-teal-light">Live</p></div></div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => toast.success("Driver tracking opened · Rajesh is 12 minutes ahead")} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-paper/10 px-4 py-3 text-xs font-bold text-paper hover:bg-paper/15"><Navigation size={15} /> Track driver</button><button type="button" onClick={() => toast.success("Privacy relay chat is ready for the operator handoff")} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-paper/10 px-4 py-3 text-xs font-bold text-paper hover:bg-paper/15"><MessageCircle size={15} /> Privacy chat</button></div></Card><div className="space-y-5"><Card className="p-5"><div className="flex items-center justify-between"><div><MiniLabel>Today · Day 1</MiniLabel><p className="mt-2 text-sm font-bold text-ink">Your travel drawer</p></div><QrBlock /></div><div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={() => toast.success("QR voucher opened")} className="pass-item text-left"><Store size={15} className="text-saffron" /><div><strong>Local stop</strong><span>QR voucher · Fixed rate</span></div><ArrowRight size={14} className="ml-auto text-ink-muted" /></button><div className="pass-item"><Hotel size={15} className="text-teal" /><div><strong>Hotel check-in</strong><span>17:30 · Pushkar</span></div></div><div className="pass-item"><Phone size={15} className="text-teal" /><div><strong>Driver contact</strong><span>Rajesh · masked</span></div></div><div className="pass-item"><FileCheck2 size={15} className="text-moss" /><div><strong>Offline ready</strong><span>All details saved</span></div></div></div></Card><button type="button" onClick={onAdapt} className="adapt-button"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber text-ink"><CloudRain size={19} /></span><span className="flex-1 text-left"><MiniLabel tone="amber">Weather watch</MiniLabel><strong className="mt-1 block text-sm text-ink">Adapt My Day</strong><small className="mt-1 block text-xs text-ink-muted">Rain may affect your outdoor trek at 2:00 PM.</small></span><ArrowRight size={17} className="text-ink-muted" /></button></div></div></div>;
}

function RippleOptions({ onResolve, resolved }: { onResolve: (key: string) => void; resolved: boolean }) {
  const [selectedKey, setSelectedKey] = useState("A");
  return <div className="space-y-8 animate-fade-up"><div className="section-heading"><MiniLabel tone="amber">06 / Ripple Engine</MiniLabel><h1>The plan changed. <em>The trip doesn't have to.</em></h1><p>Orbit checks time, distance, preferences, vendor availability, and cost—then gives the operator a clear choice.</p></div><div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]"><Card className="border-amber/22 bg-amber/7 p-6"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber text-ink"><CloudRain size={22} /></div><div><MiniLabel tone="amber">Conflict detected</MiniLabel><h2 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tighter text-ink">Heavy rain at 2:00 PM</h2><p className="mt-3 text-sm leading-6 text-ink/70">Outdoor trek is no longer safe. Three downstream bookings are affected.</p></div></div><div className="mt-8 space-y-3 border-t border-amber/18 pt-5 text-xs"><div className="flex justify-between"><span className="text-ink-muted">Affected day</span><strong>Day 2 · 12:30–16:00</strong></div><div className="flex justify-between"><span className="text-ink-muted">Traveler preference</span><strong>Culture · Food</strong></div><div className="flex justify-between"><span className="text-ink-muted">Operators impacted</span><strong>4 vendors</strong></div></div><div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-dark"><Activity size={15} /> Ripple analysis ready</div></Card><Card className="p-6"><div className="flex items-center justify-between border-b border-ink/8 pb-5"><div><MiniLabel>Resolution paths</MiniLabel><p className="mt-2 text-sm font-bold text-ink">Choose how the route should bend.</p></div><span className="rounded-full bg-teal/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-teal">3 options</span></div><div className="mt-5 space-y-3">{[{ key: "A", title: "Swap for Indoor Art Gallery", copy: "Keep the day intact. Fits Aanya's culture preference.", meta: "No timing change", price: "₹0 delta", selected: true }, { key: "B", title: "Reschedule trek to Day 3", copy: "Move the outdoor activity after the Pushkar stay.", meta: "+45 min on Day 3", price: "+₹400", selected: false }, { key: "C", title: "Issue instant refund credit", copy: "Cancel the trek and preserve the rest of the route.", meta: "Vendor credit issued", price: "−₹1,800", selected: false }].map((option) => <button type="button" key={option.key} onClick={() => !resolved && setSelectedKey(option.key)} className={cn("ripple-option w-full text-left", selectedKey === option.key && !resolved && "ripple-option-active", resolved && option.key === "A" && "ripple-option-resolved")}><div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold", selectedKey === option.key ? "bg-teal text-white" : "bg-ink/7 text-ink-muted")}>{option.key}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><strong className="text-sm text-ink">{option.title}</strong><p className="mt-1 text-xs leading-5 text-ink-muted">{option.copy}</p></div>{selectedKey === option.key && !resolved && <span className="rounded-full bg-teal/10 px-2 py-1 text-[10px] font-bold text-teal">Recommended</span>}{resolved && option.key === "A" && <span className="rounded-full bg-moss/10 px-2 py-1 text-[10px] font-bold text-moss">Applied</span>}</div><div className="mt-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-ink-muted"><span>{option.meta}</span><span className={option.price.startsWith("−") ? "text-moss" : option.price.startsWith("+") ? "text-amber-dark" : "text-teal"}>{option.price}</span></div></div></button>)}</div><Button onClick={() => onResolve(selectedKey)} disabled={resolved} className={cn("mt-5 h-11 w-full rounded-xl font-bold", resolved ? "bg-moss text-white hover:bg-moss" : "bg-ink text-paper hover:bg-ink/90")}>{resolved ? <><Check size={16} className="mr-2" /> Ripple resolved across trip</> : <><Zap size={16} className="mr-2 text-saffron-light" /> Resolve with Option {selectedKey}</>}</Button></Card></div></div>;
}

function Complete({ resolved, resolutionKey }: { resolved: boolean; resolutionKey: string }) {
  return <div className="space-y-8 animate-fade-up"><div className="section-heading"><MiniLabel tone="green">07 / Complete</MiniLabel><h1>A trip that kept its <em>shape.</em></h1><p>Not because nothing changed—because the system knew what to do when it did.</p></div><div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]"><Card className="overflow-hidden p-0"><div className="relative h-52"><img src={imageReference} alt="Jaipur road-trip landscape" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-t from-ink/80 to-transparent" /><div className="absolute bottom-5 left-6 text-paper"><p className="eyebrow text-paper/60">Trip summary · Aanya Sharma</p><h2 className="mt-2 font-display text-3xl font-semibold tracking-tighter">Jaipur circuit</h2></div></div><div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4"><div><p className="eyebrow">Total</p><p className="mt-2 text-xl font-bold">₹49,240</p></div><div><p className="eyebrow">Waypoints</p><p className="mt-2 text-xl font-bold">9</p></div><div><p className="eyebrow">Buffer</p><p className="mt-2 text-xl font-bold text-moss">30 min</p></div><div><p className="eyebrow">Status</p><p className="mt-2 text-xl font-bold text-moss">Held</p></div></div><div className="border-t border-ink/8 px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss/10 text-moss"><CheckCircle2 size={17} /></div><div><p className="text-sm font-bold text-ink">{resolutionKey === "A" ? "Ripple Engine preserved the day" : resolutionKey === "B" ? "Ripple Engine moved the weather risk" : "Ripple Engine closed the affected booking"}</p><p className="mt-1 text-xs text-ink-muted">{resolutionKey === "A" ? "Outdoor trek swapped for an indoor gallery. All affected partners notified." : resolutionKey === "B" ? "Outdoor trek moved to Day 3 and the driver buffer stayed protected." : "The trek was cancelled, a vendor credit was logged, and the rest of the route stayed intact."}</p></div></div></div></Card><div className="space-y-5"><Card className="p-5"><div className="flex items-center justify-between"><MiniLabel>Memories log</MiniLabel><button type="button" onClick={() => { navigator.clipboard?.writeText("Jaipur circuit · Aanya Sharma"); toast.success("Trip memories link copied"); }} className="icon-button h-8 w-8" aria-label="Copy trip memories link"><Copy size={15} /></button></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="memory-tile"><span>01</span><strong>Golden hour<br />at Amber Fort</strong></div><div className="memory-tile memory-tile-teal"><span>02</span><strong>Tea, rain,<br />and a good detour</strong></div></div></Card><Card className="p-5"><div className="flex items-center justify-between"><MiniLabel>Review loop</MiniLabel><Star size={15} className="text-saffron" /></div><p className="mt-3 text-sm leading-6 text-ink/75">Rate both sides of the route. Reliability scores update for the next traveler.</p><div className="mt-4 flex items-center justify-between rounded-xl bg-paper-dark px-3 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron/16 text-saffron"><Store size={15} /></div><span className="text-xs font-bold">Local stop</span></div><span className="text-xs font-bold text-moss">4.8 → 4.9</span></div><Button onClick={() => toast.success("Review loop opened · traveler and partner views paired")} variant="outline" className="mt-4 h-10 w-full rounded-xl border-ink/12 bg-paper text-xs font-bold text-ink hover:bg-paper-dark">Open dual-sided review <ArrowRight size={14} className="ml-2" /></Button></Card></div></div></div>;
}

function TravelerView({
  step,
  setStep,
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
  addedStop,
  onAddStop,
  tripTotal,
  upgraded,
  setUpgraded,
  vendorConfirmed,
  onAdapt,
  onResolve,
  resolved,
  resolutionKey,
  adults,
  setAdults,
  childrenCount,
  setChildrenCount,
  infants,
  setInfants,
  selectedPOI,
  setSelectedPOI,
  poiChatOpen,
  setPoiChatOpen,
  addedPOIs,
  setAddedPOIs,
  chatMessages,
  setChatMessages,
  chatTyping,
  setChatTyping,
}: {
  step: TravelerStep;
  setStep: (step: TravelerStep) => void;
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
  addedStop: boolean;
  onAddStop: () => void;
  tripTotal: number;
  upgraded: boolean;
  setUpgraded: (value: boolean) => void;
  vendorConfirmed: boolean;
  onAdapt: () => void;
  onResolve: (key: string) => void;
  resolved: boolean;
  resolutionKey: string;
  adults: number;
  setAdults: (value: number) => void;
  childrenCount: number;
  setChildrenCount: (value: number) => void;
  infants: number;
  setInfants: (value: number) => void;
  selectedPOI: POI | null;
  setSelectedPOI: (poi: POI | null) => void;
  poiChatOpen: boolean;
  setPoiChatOpen: (open: boolean) => void;
  addedPOIs: POI[];
  setAddedPOIs: (pois: POI[]) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  chatTyping: boolean;
  setChatTyping: (typing: boolean) => void;
}) {
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
      return <RouteRadar 
        destination={destination} 
        routePlan={routePlan} 
        addedStop={addedStop} 
        onAddStop={onAddStop} 
        tripTotal={tripTotal} 
        onNext={() => setStep(2)}
        selectedPOI={selectedPOI}
        setSelectedPOI={setSelectedPOI}
        poiChatOpen={poiChatOpen}
        setPoiChatOpen={setPoiChatOpen}
        addedPOIs={addedPOIs}
        setAddedPOIs={setAddedPOIs}
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        chatTyping={chatTyping}
        setChatTyping={setChatTyping}
      />;
    case 2:
      return <Customization upgraded={upgraded} setUpgraded={setUpgraded} addedStop={addedStop} tripTotal={tripTotal} onNext={() => setStep(3)} />;
    case 3:
      return <Checkout addedStop={addedStop} upgraded={upgraded} onNext={() => setStep(4)} />;
    case 4:
      return <DigitalPass destination={destination} onAdapt={onAdapt} vendorConfirmed={vendorConfirmed} />;
    case 5:
      return <RippleOptions onResolve={onResolve} resolved={resolved} />;
    case 6:
      return <Complete resolved={resolved} resolutionKey={resolutionKey} />;
  }
}

function OperatorDashboard({ resolved, onResolve }: { resolved: boolean; onResolve: () => void }) {
  const [showRipple, setShowRipple] = useState(false);
  const alertState = resolved ? "Resolved" : "Needs action";
  return <div className="space-y-8 animate-fade-up"><div className="section-heading flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><MiniLabel tone="teal">Operator Command Center</MiniLabel><h1>See the whole route. <em>Move one thing.</em></h1><p>A calm control surface for active trips, vendor health, margins, and the next operational risk.</p></div><div className="flex items-center gap-2"><StatusChip tone="green">12 active trips</StatusChip><StatusChip tone={resolved ? "green" : "amber"}>{resolved ? "All clear" : "1 risk needs action"}</StatusChip></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric label="Active trips" value="12" sub="+3 from yesterday" icon={Navigation} tone="teal" /><Metric label="Live margin" value="18.4%" sub="₹86,420 protected" icon={TrendingUp} tone="green" /><Metric label="Vendor response" value="94%" sub="Median · 3m 12s" icon={MessageCircle} tone="saffron" /><Metric label="Open risks" value={resolved ? "0" : "01"} sub={resolved ? "Route stable" : "Rain · Day 2"} icon={CircleAlert} tone={resolved ? "green" : "amber"} /></div><div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><Card className="overflow-hidden p-0"><div className="flex items-center justify-between border-b border-ink/8 px-5 py-4"><div><MiniLabel>Live fleet map</MiniLabel><p className="mt-2 text-sm font-bold text-ink">Active groups · North Rajasthan</p></div><button type="button" onClick={() => toast.info("Full fleet map opened in visual preview")} className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-2 text-xs font-bold text-ink-muted"><MapPin size={13} /> Full map <ChevronDown size={13} /></button></div><div className="relative h-97.5 overflow-hidden bg-[#cbd9d3]"><img src={mapImage} alt="Operational live fleet map" className="absolute inset-0 h-full w-full object-cover opacity-85" /><div className="absolute inset-0 bg-ink/5" /><div className="operator-marker left-[18%] top-[70%]"><span className="h-3 w-3 rounded-full bg-teal shadow-[0_0_0_5px_rgba(13,148,136,0.18)]" /><span>TRP-8029 · on route</span></div><div className="operator-marker left-[55%] top-[43%]"><span className="h-3 w-3 rounded-full bg-amber shadow-[0_0_0_5px_rgba(217,119,6,0.16)]" /><span>TRP-8018 · weather watch</span></div><div className="operator-marker left-[72%] top-[24%]"><span className="h-3 w-3 rounded-full bg-moss shadow-[0_0_0_5px_rgba(77,124,75,0.16)]" /><span>TRP-8004 · stable</span></div><div className="absolute bottom-4 left-4 flex gap-2 rounded-xl border border-paper/60 bg-paper/88 px-3 py-2 text-[10px] font-bold text-ink shadow-sm backdrop-blur-md"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal" /> Active</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber" /> Watch</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-moss" /> Stable</span></div></div></Card><div className="space-y-5"><Card className={cn("p-5", resolved ? "border-moss/20 bg-moss/5" : "border-amber/20 bg-amber/5")}><div className="flex items-start justify-between"><div className="flex items-center gap-2"><span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", resolved ? "bg-moss/12 text-moss" : "bg-amber text-ink")} >{resolved ? <CheckCircle2 size={17} /> : <CloudRain size={17} />}</span><div><MiniLabel tone={resolved ? "green" : "amber"}>Predictive threat matrix</MiniLabel><p className="mt-1 text-sm font-bold text-ink">{resolved ? "Weather ripple resolved" : "Heavy rain · Day 2"}</p></div></div><StatusChip tone={resolved ? "green" : "amber"}>{alertState}</StatusChip></div><p className="mt-5 text-sm leading-6 text-ink/72">{resolved ? "Indoor Art Gallery substitution cascaded to traveler, driver, hotel, guide, and vendor views." : "Outdoor trek at risk at 2:00 PM. Four connected bookings need a coordinated answer."}</p><div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-paper/70 p-3"><span className="text-ink-muted">Traveler</span><strong className="mt-1 block">Aanya Sharma</strong></div><div className="rounded-xl bg-paper/70 p-3"><span className="text-ink-muted">Impact</span><strong className="mt-1 block">4 vendors</strong></div></div>{!resolved && <Button onClick={() => setShowRipple(true)} className="mt-5 h-11 w-full rounded-xl bg-ink font-bold text-paper hover:bg-ink/90"><Zap size={15} className="mr-2 text-saffron-light" /> Open Ripple Engine</Button>}{resolved && <div className="mt-5 flex items-center gap-2 text-xs font-bold text-moss"><CheckCircle2 size={15} /> Cascade complete · 00:01:42</div>}</Card><Card className="p-5"><div className="flex items-center justify-between"><MiniLabel>Dispatch activity</MiniLabel><span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">Now</span></div><div className="mt-5 space-y-4">{[{ icon: MessageCircle, title: "Vendor confirmed", detail: "Customer #TRV-8029", tone: "teal" }, { icon: Bike, title: resolved ? "Driver route updated" : "Driver route stable", detail: resolved ? "New stop · Gallery District" : "TRP-8029 · 12 mins ahead", tone: resolved ? "green" : "saffron" }, { icon: ShieldCheck, title: "Privacy relay active", detail: "No traveler contact exposed", tone: "green" }].map((item) => { const Icon = item.icon; return <div key={item.title} className="flex items-start gap-3"><div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", item.tone === "teal" ? "bg-teal/10 text-teal" : item.tone === "saffron" ? "bg-saffron/12 text-saffron" : "bg-moss/10 text-moss")}><Icon size={14} /></div><div><p className="text-xs font-bold text-ink">{item.title}</p><p className="mt-1 text-[11px] text-ink-muted">{item.detail}</p></div></div>; })}</div></Card></div></div>{showRipple && <RippleModal onClose={() => setShowRipple(false)} onResolve={() => { onResolve(); setShowRipple(false); }} />}</div>;
}

function RippleModal({ onClose, onResolve }: { onClose: () => void; onResolve: () => void }) {
  return <div className="modal-backdrop"><div className="modal-card"><div className="flex items-start justify-between border-b border-ink/8 p-6"><div><MiniLabel tone="amber">Ripple Engine · TRP-8029</MiniLabel><h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">Resolve the rain ripple</h2><p className="mt-2 text-sm text-ink-muted">The graph found three safe paths for Aanya's Day 2.</p></div><button type="button" className="icon-button" onClick={onClose}><X size={16} /></button></div><div className="space-y-3 p-6">{[{ label: "A", title: "Swap for Indoor Art Gallery", detail: "Best preference match · ₹0 delta", tone: "teal" }, { label: "B", title: "Reschedule trek to Day 3", detail: "Adds 45 minutes to final day · +₹400", tone: "neutral" }, { label: "C", title: "Issue instant refund credit", detail: "Preserve route · −₹1,800", tone: "neutral" }].map((option) => <button key={option.label} type="button" onClick={option.label === "A" ? onResolve : () => toast.info(`${option.title} selected for visual comparison`)} className={cn("ripple-modal-option", option.tone === "teal" && "ripple-modal-option-active")}><span className={cn("flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold", option.tone === "teal" ? "bg-teal text-white" : "bg-ink/7 text-ink-muted")}>{option.label}</span><span className="flex-1 text-left"><strong className="block text-sm text-ink">{option.title}</strong><small className="mt-1 block text-xs text-ink-muted">{option.detail}</small></span>{option.tone === "teal" ? <span className="rounded-full bg-teal/10 px-2 py-1 text-[10px] font-bold text-teal">Recommended</span> : <ArrowRight size={15} className="text-ink-muted" />}</button>)}</div><div className="flex items-center justify-between border-t border-ink/8 bg-paper-dark px-6 py-4"><span className="text-xs text-ink-muted">Updates 5 connected surfaces</span><Button onClick={onResolve} className="h-10 rounded-xl bg-ink px-4 text-xs font-bold text-paper hover:bg-ink/90">Resolve cascade <ArrowRight size={14} className="ml-2" /></Button></div></div></div>;
}

function VendorView({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  const [declined, setDeclined] = useState(false);
  return <div className="space-y-8 animate-fade-up"><div className="section-heading"><MiniLabel tone="teal">Vendor Micro-Swarm</MiniLabel><h1>No new app. <em>Just the next clear action.</em></h1><p>A privacy-safe WhatsApp bridge lets local partners confirm schedules without seeing a traveler's private number.</p></div><div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]"><Card className="vendor-phone-wrap"><div className="vendor-phone"><div className="phone-notch" /><div className="flex items-center gap-3 border-b border-ink/8 bg-paper px-4 py-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/15 text-saffron"><Store size={16} /></div><div className="flex-1"><p className="text-sm font-bold text-ink">Local Store</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-moss"><span className="h-1.5 w-1.5 rounded-full bg-moss" /> WhatsApp business</p></div><MoreHorizontal size={17} className="text-ink-muted" /></div><div className="flex-1 space-y-4 bg-[#e9efe9] p-4"><div className="mx-auto w-fit rounded-full bg-paper/70 px-3 py-1 text-[10px] font-bold text-ink-muted">Today · Privacy Relay</div><div className="chat-bubble chat-bubble-in"><p className="text-xs leading-5 text-ink">New order request from <strong>Customer #TRV-8029</strong>:<br /><br /><strong>Items ready for pickup</strong><br />Arrival in 15 mins<br />System fixed rate: <strong>₹120</strong></p><div className="mt-3 flex items-center gap-1.5 rounded-lg bg-teal/8 px-2 py-2 text-[10px] font-bold text-teal"><LockKeyhole size={12} /> Traveler number hidden</div><span className="mt-2 block text-[10px] text-ink-muted">11:42 AM · delivered</span></div>{confirmed ? <div className="chat-bubble chat-bubble-out"><p className="text-xs leading-5 text-ink">Confirmed. We'll have it ready.</p><span className="mt-2 block text-[10px] text-ink-muted">11:43 AM · seen</span></div> : declined ? <div className="chat-bubble chat-bubble-out"><p className="text-xs leading-5 text-ink">Can't fulfil this request today.</p><span className="mt-2 block text-[10px] text-ink-muted">11:43 AM · sent</span><button type="button" onClick={() => setDeclined(false)} className="mt-3 text-[10px] font-bold text-teal">Reopen request</button></div> : <div className="chat-bubble chat-bubble-in"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/12 text-saffron"><TicketCheck size={15} /></span><div><strong className="block text-xs text-ink">Digital QR Voucher</strong><span className="text-[10px] text-ink-muted">Fixed menu rate · ₹120</span></div></div><div className="mt-3 flex gap-2"><button type="button" onClick={onConfirm} className="flex-1 rounded-lg bg-moss px-3 py-2 text-[10px] font-bold text-white">Confirm</button><button type="button" onClick={() => { setDeclined(true); toast.info("Decline logged · operator notified"); }} className="flex-1 rounded-lg border border-ink/10 bg-paper px-3 py-2 text-[10px] font-bold text-ink-muted">Decline</button></div></div>}</div><div className="border-t border-ink/8 bg-paper px-4 py-3"><div className="flex items-center gap-2 rounded-xl bg-paper-dark px-3 py-2 text-xs text-ink-muted"><span className="flex-1">Message</span><Send size={14} className="text-teal" /></div></div></div></Card><div className="space-y-5"><Card className="p-6"><div className="flex items-center justify-between"><div><MiniLabel tone="teal">Privacy-preserving bridge</MiniLabel><h2 className="mt-2 font-display text-2xl font-semibold tracking-tighter">The relay keeps trust visible.</h2></div><ShieldCheck size={23} className="text-teal" /></div><div className="mt-6 space-y-3">{[{ icon: LockKeyhole, title: "Anonymized proxy ID", copy: "Customer #TRV-8029 replaces personal details." }, { icon: IndianRupee, title: "Fixed transparent rate", copy: "₹120 is attached to the voucher before arrival." }, { icon: Activity, title: "Operator audit log", copy: confirmed ? "Confirmed · 11:43 AM · response time 1m" : "Waiting for vendor confirmation · alert at 10m" }].map((item) => { const Icon = item.icon; return <div key={item.title} className="flex items-start gap-3 rounded-xl bg-paper-dark p-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal"><Icon size={15} /></div><div><p className="text-xs font-bold text-ink">{item.title}</p><p className="mt-1 text-xs leading-5 text-ink-muted">{item.copy}</p></div></div>; })}</div></Card><Card className={cn("p-6", confirmed ? "border-moss/20 bg-moss/5" : "border-saffron/18 bg-saffron/5")}><div className="flex items-center gap-3"><div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", confirmed ? "bg-moss/12 text-moss" : "bg-saffron/12 text-saffron")} >{confirmed ? <CheckCircle2 size={18} /> : <Timer size={18} />}</div><div><MiniLabel tone={confirmed ? "green" : "saffron"}>Command center sync</MiniLabel><p className="mt-1 text-sm font-bold text-ink">{confirmed ? "Traveler pass updated" : "Confirmation pending"}</p></div></div><div className="mt-5 flex items-center gap-2 text-xs text-ink-muted"><span className={cn("h-2 w-2 rounded-full", confirmed ? "bg-moss" : "bg-saffron")} /> {confirmed ? "Logged without exposing personal data" : "No phone number or full name shown"}</div></Card></div></div></div>;
}

const BASE_TRIP_PRICE = 47800;
const LOCAL_STOP_PRICE = 240;

export default function Home() {
  const [mode, setMode] = useState<Mode>("traveler");
  const [step, setStep] = useState<TravelerStep>(0);
  const [destination, setDestination] = useState("Jaipur, Rajasthan");
  const routePlan = useMemo(() => createRoutePlan(destination), [destination]);

  // Intake Canvas form state
  const [budget, setBudget] = useState([50000]);
  const [dates, setDates] = useState("");
  const [durationDays, setDurationDays] = useState(3);
  const [pickupMode, setPickupMode] = useState<PickupMode>("home");
  const [pickupAddress, setPickupAddress] = useState("");
  const [styles, setStyles] = useState(["Local Street Food", "Culture & History"]);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);

  // Legacy state for the old stop system
  const [addedStop, setAddedStop] = useState(false);
  
  // New POI system state
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

  // Update tripTotal when POIs are added
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
  };
  const openAdapt = () => setStep(5);
  const resolve = (key = "A") => { setResolutionKey(key); setResolved(true); setStep(6); };

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
            <div className="hidden items-center gap-2 text-right md:flex">
              <div><p className="eyebrow">Demo session</p><p className="mt-1 text-xs font-bold text-ink">TRP-8029 <span className="mx-1 text-ink-muted">·</span> Simulated state</p></div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/10 text-teal"><Gauge size={16} /></div>
            </div>
          </div>
          {mode === "traveler" && <ProgressRail step={step} />}
          {mode === "traveler" ? (
            <TravelerView
              step={step}
              setStep={setStep}
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
              addedStop={addedStop}
              onAddStop={addLocalStop}
              tripTotal={tripTotal}
              upgraded={upgraded}
              setUpgraded={setUpgraded}
              vendorConfirmed={vendorConfirmed}
              onAdapt={openAdapt}
              onResolve={resolve}
              resolved={resolved}
              resolutionKey={resolutionKey}
              adults={adults}
              setAdults={setAdults}
              childrenCount={childrenCount}
              setChildrenCount={setChildrenCount}
              infants={infants}
              setInfants={setInfants}
              selectedPOI={selectedPOI}
              setSelectedPOI={setSelectedPOI}
              poiChatOpen={poiChatOpen}
              setPoiChatOpen={setPoiChatOpen}
              addedPOIs={addedPOIs}
              setAddedPOIs={setAddedPOIs}
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatTyping={chatTyping}
              setChatTyping={setChatTyping}
            />
          ) : mode === "operator" ? (
            <OperatorDashboard resolved={resolved} onResolve={() => setResolved(true)} />
          ) : (
            <VendorView confirmed={vendorConfirmed} onConfirm={() => setVendorConfirmed(true)} />
          )}
        </main>
      </div>
    </div>
  );
}