"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Image as ImageIcon, Trash2, Check, AlertCircle, Loader2 } from "lucide-react"
import { useBrandFiles } from "@/hooks/use-brand-files"

interface BrandImageManagerProps {
  brandId: number;
  userId: number;
  initialImages?: {
    logo?: { url: string; name: string };
    isotipo?: { url: string; name: string };
    imagotipo?: { url: string; name: string };
  };
}

export function BrandImageManager({ brandId, userId, initialImages }: BrandImageManagerProps) {
  const { uploadBrandImage, isLoading, error } = useBrandFiles();
  const [images, setImages] = useState(initialImages || {});
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  
  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const isotipoInputRef = useRef<HTMLInputElement>(null);
  const imagotipoInputRef = useRef<HTMLInputElement>(null);

  const imageTypes = [
    {
      key: 'logo',
      label: 'Logotipo',
      description: 'Logo principal de tu marca',
      inputRef: logoInputRef,
      type: 'LOGO' as const
    },
    {
      key: 'isotipo',
      label: 'Isotipo',
      description: 'Símbolo o ícono de tu marca',
      inputRef: isotipoInputRef,
      type: 'ISOTIPO' as const
    },
    {
      key: 'imagotipo',
      label: 'Imagotipo',
      description: 'Combinación de texto e ícono',
      inputRef: imagotipoInputRef,
      type: 'IMAGOTIPO' as const
    }
  ];

  const handleFileSelect = async (file: File, imageType: typeof imageTypes[0]) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB permitido');
      return;
    }

    setUploadingType(imageType.key);

    try {
      const result = await uploadBrandImage(file, brandId, imageType.type, userId);

      if (result.success && result.file) {
        setImages(prev => ({
          ...prev,
          [imageType.key]: {
            url: result.file!.url,
            name: result.file!.name
          }
        }));
        
        // Clear the input
        if (imageType.inputRef.current) {
          imageType.inputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingType(null);
    }
  };

  const handleUploadClick = (imageType: typeof imageTypes[0]) => {
    imageType.inputRef.current?.click();
  };

  const getImagePreview = (imageKey: string) => {
    const image = images[imageKey as keyof typeof images];
    if (image?.url) {
      return (
        <div className="relative">
          <img
            src={image.url}
            alt={imageKey}
            className="w-20 h-20 object-cover rounded border"
          />
          <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-700">
            <Check className="w-3 h-3" />
          </Badge>
        </div>
      );
    }
    
    return (
      <div className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Imágenes de la Marca
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-4">
          {imageTypes.map((imageType) => (
            <div key={imageType.key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                {getImagePreview(imageType.key)}
                <div>
                  <h4 className="font-medium">{imageType.label}</h4>
                  <p className="text-sm text-gray-600">{imageType.description}</p>
                  {images[imageType.key as keyof typeof images] && (
                    <p className="text-xs text-gray-500 mt-1">
                      {images[imageType.key as keyof typeof images]?.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={imageType.inputRef}
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, imageType);
                  }}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUploadClick(imageType)}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {uploadingType === imageType.key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {images[imageType.key as keyof typeof images] ? 'Cambiar' : 'Subir'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Formatos soportados: JPG, PNG, GIF, WebP, SVG</p>
          <p>• Tamaño máximo: 5MB por imagen</p>
          <p>• Recomendación: Imágenes cuadradas de al menos 200x200px</p>
        </div>
      </CardContent>
    </Card>
  );
}
