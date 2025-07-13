export enum MedicalSupplyType {
  MEDICAMENTOS = 1,
  UNIFORMES = 2,
  EQUIPOS_ODONTOLOGICOS = 3,
}

export type AlertPriority = "low" | "medium" | "high" | "critical"
export type AlertType = "low_stock" | "expired" | "expiring_soon" | "out_of_stock" | "maintenance_required"
export type ProductStatus = "available" | "low_stock" | "expired" | "discontinued"

// Interfaz mejorada para estadísticas de productos disponibles
export interface EnhancedAvailableProductsStats {
  // Estadísticas básicas de productos DISPONIBLES
  totalAvailableProducts: number
  totalAvailableValue: number

  // Análisis de productos disponibles
  availableWithLowStock: number
  availableNearExpiry: number // Solo medicamentos

  // Detalles específicos de productos disponibles
  lowStockAvailableDetails: AvailableProductDetail[]
  nearExpiryAvailableDetails: NearExpiryProductDetail[]

  // Distribución por categorías (solo disponibles)
  categoryDistribution: CategoryDistribution[]

  // Análisis de disponibilidad general
  availabilityAnalysis: AvailabilityAnalysis

  // Distribución de niveles de stock
  stockDistribution: StockDistribution
}

export interface AvailableProductDetail {
  id: number
  name: string
  code: string
  stock: number
  minStock: number
  category: string
  provider: string
  urgencyLevel: "low" | "medium" | "high" | "critical"
}

export interface NearExpiryProductDetail {
  id: number
  name: string
  code: string
  expirationDate: string
  daysToExpiry: number
  category: string
  riskLevel: "low" | "medium" | "high"
}

export interface CategoryDistribution {
  categoryName: string
  availableCount: number
  percentage: number
  averageStock: number
  lowStockCount: number
}

export interface AvailabilityAnalysis {
  totalProductsInSystem: number
  availableProducts: number
  availabilityPercentage: number
  notAvailableProducts: number
  expiredProducts: number
  discontinuedProducts: number
}

export interface StockDistribution {
  highStock: number // > threshold alto
  mediumStock: number // threshold medio
  lowStock: number // < threshold bajo
  criticalStock: number // stock crítico
}

// Mantener interfaces existentes para compatibilidad
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
  // Nuevas opciones para reportes mejorados
  focusOnAvailable?: boolean
  includeDetailedAnalysis?: boolean
  includeCategoryBreakdown?: boolean
  includeRecommendations?: boolean
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

// Nuevas interfaces para reportes mejorados
export interface EnhancedReportMetadata {
  reportType: "enhanced_available_products" | "standard_inventory" | "movement_analysis"
  focusedOn: string
  generatedAt: string
  improvements: string[]
  dataQuality: {
    completeness: number
    accuracy: number
    timeliness: number
  }
}

export interface RecommendationItem {
  type: "restock" | "monitor" | "action_required" | "optimization"
  priority: AlertPriority
  productId?: number
  productName?: string
  description: string
  suggestedAction: string
  estimatedCost?: number
  timeframe: "immediate" | "short_term" | "medium_term" | "long_term"
}

export interface EnhancedReportSummary {
  availabilityScore: number // 0-100
  stockHealthScore: number // 0-100
  riskLevel: "low" | "medium" | "high" | "critical"
  keyInsights: string[]
  recommendations: RecommendationItem[]
  nextReviewDate: string
}
