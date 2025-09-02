// types/profile.types.ts
export interface ClientProfile {
    id: number
    firstName: string
    lastName: string
    email: string
    phone?: string
    notes?: string
    avatar?: string
    memberSince: string
    isActive: boolean
    role: string
}

export interface EditProfileData {
    firstName: string
    lastName: string
    email: string
    phone?: string
    notes?: string
}

export interface ProfileStats {
    totalAppointments: number
    completedAppointments: number
    totalSpent: number
}

export interface RecentAppointment {
    id: string
    serviceName: string
    date: string
    time: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    amount: number
}
