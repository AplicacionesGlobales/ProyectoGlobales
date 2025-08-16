// landing\app\panel\clientes\page.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Phone, Mail, Calendar } from "lucide-react"

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tu base de datos de clientes y su historial.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes por nombre, teléfono o email..."
              className="flex-1"
            />
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Clientes
            </CardTitle>
            <CardDescription>
              147 clientes registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Cliente 1 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">JP</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Juan Pérez</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        +1 234 567 8900
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        juan@email.com
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Última visita</p>
                    <p className="text-sm text-muted-foreground">Hace 2 días</p>
                  </div>
                  <Badge variant="secondary">Regular</Badge>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    Agendar
                  </Button>
                </div>
              </div>

              {/* Cliente 2 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-green-700">MG</span>
                  </div>
                  <div>
                    <h3 className="font-medium">María García</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        +1 234 567 8901
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        maria@email.com
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Última visita</p>
                    <p className="text-sm text-muted-foreground">Hace 1 semana</p>
                  </div>
                  <Badge variant="default">VIP</Badge>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    Agendar
                  </Button>
                </div>
              </div>

              {/* Cliente 3 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-700">CL</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Carlos López</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        +1 234 567 8902
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        carlos@email.com
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Última visita</p>
                    <p className="text-sm text-muted-foreground">Hace 3 semanas</p>
                  </div>
                  <Badge variant="outline">Nuevo</Badge>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    Agendar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
