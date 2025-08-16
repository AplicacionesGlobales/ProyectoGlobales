'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Smartphone, LogOut, User, CreditCard, Calendar } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  name: string;
  businessType: string;
  brandName: string;
  plan: string;
  paymentStatus: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userDataStr = localStorage.getItem('userData');

    if (!token || !userDataStr) {
      router.push('/auth/login');
      return;
    }

    try {
      const user = JSON.parse(userDataStr);
      setUserData(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    router.push('/');
  };

  const downloadApp = () => {
    // Aquí implementarías la lógica para descargar la aplicación
    alert('Descarga de la aplicación móvil iniciada. Te enviaremos un enlace a tu email.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Hola, <span className="font-medium">{userData.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a tu Dashboard! 🎉
          </h2>
          <p className="text-lg text-gray-600">
            Tu aplicación está lista para ser descargada y personalizada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información de tu Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-lg font-semibold text-gray-900">{userData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-lg font-semibold text-gray-900">{userData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nombre de la Marca</label>
                    <p className="text-lg font-semibold text-gray-900">{userData.brandName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Negocio</label>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{userData.businessType}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Plan Contratado
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default" className="text-lg py-1 px-3 capitalize">
                        {userData.plan}
                      </Badge>
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Pagado
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Registro
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(userData.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Download App Card */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Smartphone className="h-5 w-5" />
                  Tu Aplicación Móvil
                </CardTitle>
                <CardDescription className="text-green-700">
                  ¡Tu app está lista! Descárgala ahora.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={downloadApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar Aplicación
                </Button>
                <p className="text-xs text-green-600 mt-2 text-center">
                  Compatible con Android e iOS
                </p>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Registro</span>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pago</span>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">App Generada</span>
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Lista
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card>
              <CardHeader>
                <CardTitle>¿Necesitas Ayuda?</CardTitle>
                <CardDescription>
                  Estamos aquí para apoyarte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Contactar Soporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
              <CardDescription>
                Aquí tienes algunas sugerencias para aprovechar al máximo tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Download className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Descarga tu App</h3>
                  <p className="text-sm text-gray-600">
                    Instala la aplicación en tu dispositivo móvil y comienza a explorar las funcionalidades.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Personaliza tu Perfil</h3>
                  <p className="text-sm text-gray-600">
                    Configura tu información de empresa y personaliza la apariencia según tu marca.
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Comparte con tu Equipo</h3>
                  <p className="text-sm text-gray-600">
                    Invita a tu equipo y comienza a usar la aplicación para gestionar tu negocio.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
