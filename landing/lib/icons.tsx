import { 
  Calendar,
  CreditCard,
  Users,
  MapPin,
  FolderOpen,
  Image,
  Mail,
  BarChart3,
  TrendingUp,
  Camera,
  Video,
  Stethoscope,
  Scissors,
  Briefcase,
  Heart,
  Dumbbell,
  Building,
  Smartphone
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Mapeo de IDs de iconos a componentes de Lucide
export const iconMap: Record<string, LucideIcon> = {
  // Business Types
  'fotografo': Camera,
  'camarografo': Video,
  'medico': Stethoscope,
  'estilista': Scissors,
  'consultor': Briefcase,
  'masajista': Heart,
  'entrenador': Dumbbell,
  'otro': Building,
  
  // App Features
  'citas': Calendar,
  'pagos': CreditCard,
  'clientes': Users,
  'ubicaciones': MapPin,
  'archivos': FolderOpen,
  'galerias': Image,
  'recordatorios': Mail,
  'reportes': BarChart3,
  'seguimiento': TrendingUp,
  'app': Smartphone,
  'mobile': Smartphone,
};

// Componente helper para renderizar iconos
interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = "" }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Fallback a un icono por defecto si no se encuentra el icono
    return <Building size={size} className={className} />;
  }
  
  return <IconComponent size={size} className={className} />;
};
