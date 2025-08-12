import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { SessionState } from '../types/auth.types';

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessName?: string;
  profileImage?: string;
  phone?: string;
  address?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: string;
  isActive: boolean;
  isOnline: boolean;
  isAtHome: boolean;
  isInStore: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  location?: string;
  type: 'online' | 'at-home' | 'in-store';
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

interface AppContextType {
  user: User | null;
  services: Service[];
  appointments: Appointment[];
  clients: User[];
  // Métodos actualizados
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Nuevos métodos para sesiones perpetuas
  isAuthenticated: () => Promise<boolean>;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  // Métodos de servicios (mantenidos)
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  bookAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  cancelAppointment: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Sesión de Fotos Profesional',
    description: 'Sesión de fotografía profesional de 2 horas',
    price: 150,
    duration: 120,
    category: 'Fotografía',
    isActive: true,
    isOnline: false,
    isAtHome: true,
    isInStore: true,
  },
  {
    id: '2',
    name: 'Consulta Psicológica Online',
    description: 'Sesión de terapia psicológica vía videollamada',
    price: 80,
    duration: 60,
    category: 'Salud Mental',
    isActive: true,
    isOnline: true,
    isAtHome: false,
    isInStore: true,
  },
  {
    id: '3',
    name: 'Corte y Peinado',
    description: 'Servicio completo de peluquería',
    price: 35,
    duration: 90,
    category: 'Belleza',
    isActive: true,
    isOnline: false,
    isAtHome: false,
    isInStore: true,
  },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: 'client1',
    serviceId: '1',
    date: '2025-08-01',
    time: '10:00',
    status: 'confirmed',
    type: 'in-store',
    totalAmount: 150,
    paymentStatus: 'paid',
    notes: 'Sesión para portafolio profesional',
  },
  {
    id: '2',
    clientId: 'client2',
    serviceId: '2',
    date: '2025-08-02',
    time: '15:30',
    status: 'pending',
    type: 'online',
    totalAmount: 80,
    paymentStatus: 'pending',
  },
];

const mockClients: User[] = [
  {
    id: 'client1',
    name: 'María García',
    email: 'maria@example.com',
    role: 'client',
    phone: '+1234567890',
  },
  {
    id: 'client2',
    name: 'Carlos López',
    email: 'carlos@example.com',
    role: 'client',
    phone: '+0987654321',
  },
];

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [clients] = useState<User[]>(mockClients);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Nuevo estado de carga

  // Auto-verificación de autenticación al iniciar la app
  useEffect(() => {
    console.log('🚀 AppProvider iniciado - verificando autenticación...');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔍 Verificando estado de autenticación...');

      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const userData = await authService.getCurrentUser();

        if (userData && userData.user) {
          console.log('✅ Usuario autenticado encontrado:', userData.user.email);

          // Mapear los datos del authService al formato del contexto
          setUser({
            id: userData.user.id.toString(),
            name: `${userData.user.firstName || ''} ${userData.user.lastName || ''}`.trim() || userData.user.username,
            email: userData.user.email,
            role: userData.user.role === 'ADMIN' || userData.user.role === 'ROOT' ? 'admin' : 'client',
            businessName: userData.brand?.name,
          });

          console.log('🎉 Auto-login exitoso');
        } else {
          console.log('❌ No se encontraron datos de usuario válidos');
          setUser(null);
        }
      } else {
        console.log('❌ Usuario no autenticado');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('✅ Verificación de autenticación completada');
    }
  };

  const isAuthenticated = async (): Promise<boolean> => {
    try {
      return await authService.isAuthenticated();
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Este método ahora es principalmente para compatibilidad con el código existente
      // El login real se maneja en login.tsx con authService.login()

      // Verificar si ya está autenticado después del login
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        // Actualizar el estado del contexto
        await checkAuthStatus();
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Error en login del contexto:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logout iniciado desde contexto...');

      // Usar el authService para logout completo
      await authService.logout();

      // Usar startTransition para evitar warnings de React
      React.startTransition(() => {
        setUser(null);
      });

      console.log('✅ Logout completado desde contexto');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // Limpiar estado local aunque falle, usando startTransition
      React.startTransition(() => {
        setUser(null);
      });
    }
  };

  const addService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, updatedService: Partial<Service>) => {
    setServices(prev => prev.map(service =>
      service.id === id ? { ...service, ...updatedService } : service
    ));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const bookAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, updatedAppointment: Partial<Appointment>) => {
    setAppointments(prev => prev.map(appointment =>
      appointment.id === id ? { ...appointment, ...updatedAppointment } : appointment
    ));
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(appointment =>
      appointment.id === id ? { ...appointment, status: 'cancelled' as const } : appointment
    ));
  };

  return (
    <AppContext.Provider value={{
      user,
      services,
      appointments,
      clients,
      login,
      logout,
      // Nuevos métodos para sesiones perpetuas
      isAuthenticated,
      isLoading,
      checkAuthStatus,
      // Métodos de servicios (mantenidos)
      addService,
      updateService,
      deleteService,
      bookAppointment,
      updateAppointment,
      cancelAppointment,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
