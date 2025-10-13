// services/payments.service.ts

export interface PaymentRecord {
  id: number
  date: string
  amount: number
  status: string
  currency: string
  paymentMethod?: string
  reference?: string
  description?: string
  type: string
  processedAt?: string
}

export const paymentsService = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

  /**
   * Obtener historial de pagos de un brand
   */
  async getPaymentsByBrand(brandId: number): Promise<{ success: boolean; data?: PaymentRecord[]; errors?: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/brand/${brandId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error: any) {
      console.error('Error fetching payments:', error)
      return {
        success: false,
        errors: [{ description: 'Error obteniendo historial de pagos' }]
      }
    }
  },

  /**
   * Descargar recibo PDF
   */
  downloadReceipt(paymentId: number): void {
    try {
      // Crear un enlace temporal para descarga
      const link = document.createElement('a')
      link.href = `${this.baseUrl}/api/receipts/${paymentId}`
      link.download = `recibo-${paymentId}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading receipt:', error)
    }
  },

  /**
   * Cambiar plan de suscripción
   */
  async changePlan(brandId: number, newPlanId: number): Promise<{ success: boolean; data?: any; errors?: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/billing/change-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId,
          newPlanId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error: any) {
      console.error('Error changing plan:', error)
      return {
        success: false,
        errors: [{ description: 'Error cambiando plan de suscripción' }]
      }
    }
  }
}