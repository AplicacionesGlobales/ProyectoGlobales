// components/panel/clientes/index.ts

// Exportar todos los componentes de clientes
export { ClientDetailView } from './ClientDetailView'
export { ClientForm } from './ClientForm'

// Exportar tipos relacionados si es necesario
export type { 
  Client,
  CreateClientData,
  ClientsListResponse
} from '@/services/client.service'