"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Upload, AlertCircle, Loader2 } from "lucide-react"

interface ImageUploadProgressProps {
  images: {
    logo?: File;
    isotipo?: File; 
    imagotipo?: File;
  };
  uploadResults?: {
    logo?: { success: boolean; error?: string };
    isotipo?: { success: boolean; error?: string };
    imagotipo?: { success: boolean; error?: string };
  };
  isUploading: boolean;
}

export function ImageUploadProgress({ images, uploadResults, isUploading }: ImageUploadProgressProps) {
  const imageTypes = [
    { key: 'logo', label: 'Logotipo', file: images.logo },
    { key: 'isotipo', label: 'Isotipo', file: images.isotipo },
    { key: 'imagotipo', label: 'Imagotipo', file: images.imagotipo }
  ];

  const getStatusIcon = (imageKey: string) => {
    if (!isUploading && !uploadResults) {
      return <Upload className="w-4 h-4 text-gray-400" />;
    }

    const result = uploadResults?.[imageKey as keyof typeof uploadResults];
    
    if (isUploading && !result) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }

    if (result?.success) {
      return <Check className="w-4 h-4 text-green-500" />;
    }

    if (result && !result.success) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    return <Upload className="w-4 h-4 text-gray-400" />;
  };

  const getStatusBadge = (imageKey: string) => {
    if (!isUploading && !uploadResults) {
      return <Badge variant="secondary">Pendiente</Badge>;
    }

    const result = uploadResults?.[imageKey as keyof typeof uploadResults];
    
    if (isUploading && !result) {
      return <Badge className="bg-blue-100 text-blue-700">Subiendo...</Badge>;
    }

    if (result?.success) {
      return <Badge className="bg-green-100 text-green-700">Completado</Badge>;
    }

    if (result && !result.success) {
      return <Badge variant="destructive">Error</Badge>;
    }

    return <Badge variant="secondary">Pendiente</Badge>;
  };

  // Only show if there are images to upload
  const hasImages = imageTypes.some(type => type.file);

  if (!hasImages) {
    return null;
  }

  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <Upload className="w-5 h-5 text-gray-600" />
        <h4 className="font-medium text-gray-900">Subida de imágenes</h4>
      </div>
      
      <div className="space-y-2">
        {imageTypes.map((imageType) => {
          if (!imageType.file) return null;
          
          return (
            <div key={imageType.key} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center gap-3">
                {getStatusIcon(imageType.key)}
                <div>
                  <p className="text-sm font-medium">{imageType.label}</p>
                  <p className="text-xs text-gray-500">{imageType.file.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(imageType.key)}
              </div>
            </div>
          );
        })}
      </div>

      {uploadResults && Object.values(uploadResults).some(result => result && !result.success) && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
          <p className="text-xs text-orange-700">
            Algunas imágenes no se pudieron subir. Podrás subirlas más tarde desde el panel de administración.
          </p>
        </div>
      )}
    </Card>
  );
}
