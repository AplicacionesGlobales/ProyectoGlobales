'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, CheckCircle, MapPin } from 'lucide-react';
import type { BrandInfo } from '@/api/types';

interface BrandInfoCardProps {
  brandInfo: BrandInfo;
}

export function BrandInfoCard({ brandInfo }: BrandInfoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysLabel = (days: number) => {
    if (days === 0) return 'Hoy';
    if (days === 1) return '1 día';
    if (days < 30) return `${days} días`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? '1 mes' : `${months} meses`;
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    let result = years === 1 ? '1 año' : `${years} años`;
    if (remainingMonths > 0) {
      result += ` y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
    }
    return result;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <CardTitle>Información de la Marca</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Brand Name & Status */}
        <div className="space-y-3">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {brandInfo.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge 
                variant={brandInfo.isActive ? "default" : "destructive"}
                className={brandInfo.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {brandInfo.isActive ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activa
                  </>
                ) : (
                  'Inactiva'
                )}
              </Badge>
              <span className="text-sm text-gray-500">ID: #{brandInfo.id}</span>
            </div>
          </div>
          
          <Separator />
          
          {/* Business Type */}
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tipo de Negocio</p>
              <p className="text-base font-semibold text-gray-900 capitalize">
                {brandInfo.businessType}
              </p>
            </div>
          </div>
          
          {/* Creation Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
              <p className="text-base font-semibold text-gray-900">
                {formatDate(brandInfo.createdAt)}
              </p>
              <p className="text-sm text-gray-500">
                Hace {getDaysLabel(brandInfo.daysSinceCreation)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Resumen Rápido</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">
                {brandInfo.daysSinceCreation}
              </p>
              <p className="text-xs text-gray-500">Días Activa</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">
                {brandInfo.isActive ? 'Online' : 'Offline'}
              </p>
              <p className="text-xs text-gray-500">Estado</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}