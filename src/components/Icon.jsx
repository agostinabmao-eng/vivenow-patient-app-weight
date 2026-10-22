import {
  Bell,
  WifiOff,
  Check,
  Activity,
  Footprints,
  Flame,
  Scale,
  ChevronRight,
  Home,
  PhoneCall,
  ArrowLeft,
  Pill,
  Dumbbell,
  Play,
  AlertTriangle,
  Minus,
  Plus,
  Droplet,
  Droplets,
  Utensils,
  Mic,
  MicOff,
  TrendingUp,
  TrendingDown,
  Share2,
  Pencil,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Calendar,
  User,
  Shield,
  HelpCircle,
  LogOut,
  Stethoscope,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  PersonStanding,
  X,
  ClipboardList,
  MessageCircle,
  BookOpen,
  Lock,
} from 'lucide-react';

// Named import map (not a `import *` barrel) so the bundler can tree-shake
// every lucide icon this app doesn't use.
const ICONS = {
  bell: Bell,
  'wifi-off': WifiOff,
  check: Check,
  activity: Activity,
  footprints: Footprints,
  flame: Flame,
  scale: Scale,
  'chevron-right': ChevronRight,
  home: Home,
  'phone-call': PhoneCall,
  'arrow-left': ArrowLeft,
  pill: Pill,
  dumbbell: Dumbbell,
  play: Play,
  'alert-triangle': AlertTriangle,
  minus: Minus,
  plus: Plus,
  droplet: Droplet,
  droplets: Droplets,
  utensils: Utensils,
  mic: Mic,
  'mic-off': MicOff,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  share: Share2,
  pencil: Pencil,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  calendar: Calendar,
  user: User,
  shield: Shield,
  'help-circle': HelpCircle,
  'log-out': LogOut,
  stethoscope: Stethoscope,
  'bar-chart': BarChart3,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'arrow-right': ArrowRight,
  'volume-2': Volume2,
  'volume-x': VolumeX,
  maximize: Maximize2,
  minimize: Minimize2,
  'person-standing': PersonStanding,
  x: X,
  'clipboard-list': ClipboardList,
  'message-circle': MessageCircle,
  'book-open': BookOpen,
  lock: Lock,
};

/** Wrapper over lucide-react, addressed by the same kebab-case names used in
 * the design system (e.g. "phone-call", "chevron-right"). */
export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 2, style, ...rest }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  // Icons render ~25% larger than the size the call site asks for — the
  // design spec calls for oversized, straightforward icons.
  const px = Math.round(size * 1.25);
  return (
    <Cmp
      width={px}
      height={px}
      color={color}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0, ...style }}
      {...rest}
    />
  );
}
