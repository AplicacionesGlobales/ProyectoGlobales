"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { AppointmentCalendar } from "@/components/panel/appointments/appointmentCalendar"
import { AppointmentList } from "@/components/panel/appointments/appointmentList"
import { CreateAppointmentModal } from "@/components/modals/appointment/create-appointment-modal"
import { PageHeader } from "@/components/reusable-components/PageHeader"
import { useAppointments } from "@/hooks/use-appointments"

export default function AdminAppointmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Ahora no necesitas pasar brandId, se obtiene automáticamente del localStorage
  const { 
    appointments, 
    monthAppointments,
    clients, 
    selectedDate,
    currentMonth,
    loading,
    loadingMonth,
    createLoading,
    createError,
    createSuccess,
    handleDateSelect,
    handleMonthNavigate,
    handleStatusChange,
    handleCreateAppointment,
    clearMessages
  } = useAppointments()

  // Manejar creación de cita con manejo de modal
  const handleCreateAppointmentWithModal = async (data: any) => {
    try {
      await handleCreateAppointment(data)
      
      // Cerrar modal después de éxito (con delay para mostrar mensaje)
      setTimeout(() => {
        setShowCreateModal(false)
        clearMessages()
      }, 2000)
    } catch (error) {
      // Error ya manejado en el hook
      console.error('Error in modal:', error)
    }
  }

  // Manejar apertura de modal
  const handleOpenCreateModal = () => {
    clearMessages()
    setShowCreateModal(true)
  }

  // Manejar cierre de modal
  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
    clearMessages()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6"> 
        {/* Header de la página */}
        <PageHeader
          title="Gestión de Citas"
          subtitle="Administra las citas de tu negocio desde un solo lugar"
          primaryAction={{
            text: "Nueva Cita",
            icon: Plus,
            onClick: handleOpenCreateModal
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <AppointmentCalendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              monthAppointments={monthAppointments}
              loadingMonth={loadingMonth}
              onDateSelect={handleDateSelect}
              onMonthNavigate={handleMonthNavigate}
            />
          </div>

          {/* Lista de Citas */}
          <div className="space-y-4">
            <AppointmentList
              selectedDate={selectedDate}
              appointments={appointments}
              loading={loading}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Modal de crear cita */}
        <CreateAppointmentModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateAppointmentWithModal}
          clients={clients}
          loading={createLoading}
          error={createError}
          success={createSuccess}
        />
      </div>
    </div>
  )
}