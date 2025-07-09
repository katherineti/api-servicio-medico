export enum MedicalSupplyType {
  MEDICAMENTOS = 1,
  UNIFORMES = 2,
  EQUIPOS_ODONTOLOGICOS = 3,
}

export type AlertPriority = "low" | "medium" | "high" | "critical"
export type AlertType = "low_stock" | "expired" | "expiring_soon" | "out_of_stock" | "maintenance_required"
export type ProductStatus = "available" | "low_stock" | "expired" | "discontinued"

export interface MedicalSupplyStats {
  totalItems: number
  availableItems: number
  lowStockItems: number
  expiredItems?: number // Solo para medicamentos
  totalValue: number
  averagePrice: number
  topItems: TopItem[]
}

export interface TopItem {
  name: string
  quantity: number
  value: number
  status: ProductStatus
  expirationDate?: string // Solo para medicamentos
}

export interface MedicalSupplyReportData {
  type: MedicalSupplyType
  typeName: string
  stats: MedicalSupplyStats
  date: string
  title: string
  filename?: string
  additionalInfo?: any
}

export interface MedicalSupplyReportOptions {
  supplyType: MedicalSupplyType
  includeExpired?: boolean
  minStockThreshold?: number
  reportDate?: Date
}

export interface ProductInfo {
  id: number
  name: string
  description?: string
  quantity: number
  unitPrice: number
  totalValue: number
  category?: string
  supplier?: string
  expirationDate?: Date
  status: ProductStatus
  lastUpdated: Date
}

export interface InventoryAlert {
  type: AlertType
  productId: number
  productName: string
  message: string
  priority: AlertPriority
  createdAt: Date
  details?: {
    currentStock?: number
    minimumStock?: number
    expirationDate?: Date
    daysUntilExpiration?: number
  }
}

export interface AlertSummary {
  total: number
  critical: number
  high: number
  medium: number
  low: number
}
