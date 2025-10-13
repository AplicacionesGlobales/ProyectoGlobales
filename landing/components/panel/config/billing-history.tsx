import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface BillingRecord {
  id: number
  date: string
  amount: number
  status: string
}

interface BillingHistoryProps {
  records?: BillingRecord[]
  onDownload?: (id: number) => void
}

export const BillingHistory = ({ records = [], onDownload }: BillingHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Facturación</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-muted-foreground">No hay facturas disponibles</p>
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <div className="font-medium">Factura #{r.id}</div>
                  <div className="text-sm text-muted-foreground">{new Date(r.date).toLocaleDateString('es-ES')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-semibold">${r.amount.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{r.status}</div>
                  </div>
                  <Button variant="ghost" onClick={() => onDownload?.(r.id)}>Descargar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
