// components/configuraciones/AppearanceTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Palette } from "lucide-react"
import { AppearanceSettings } from "@/types/config"
import { LANGUAGE_OPTIONS } from "@/constants/config"

interface AppearanceTabProps {
  appearanceSettings: AppearanceSettings
  saving: boolean
  onAppearanceChange: (field: keyof AppearanceSettings, value: any) => void
  onSave: () => void
}

export const AppearanceTab = ({ 
  appearanceSettings, 
  saving, 
  onAppearanceChange, 
  onSave 
}: AppearanceTabProps) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Personalización
        </CardTitle>
        <CardDescription>
          Personaliza la apariencia de tu panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Modo Oscuro</Label>
            <p className="text-sm text-muted-foreground">
              Activar tema oscuro para el panel
            </p>
          </div>
          <Switch 
            checked={appearanceSettings.darkMode}
            onCheckedChange={(checked) => onAppearanceChange('darkMode', checked)}
          />
        </div>
        <Separator />
        <div className="space-y-2">
          <Label>Idioma</Label>
          <select 
            className="w-full p-2 border rounded-md"
            value={appearanceSettings.language}
            onChange={(e) => onAppearanceChange('language', e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar Apariencia'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}