export interface AssignmentRegistrationByDay {
  day: number
  date: string
  count: number
}

export interface AssignmentsByEmployee {
  employeeId: number
  employeeName: string
  employeeCedula: string
  assignmentCount: number
  totalProducts: number
}

export interface AssignmentsByProductType {
  typeId: number
  typeName: string
  assignmentCount: number
  totalProducts: number
}

export interface AssignmentsByFamily {
  familyId: number
  familyName: string
  familyCedula: string
  employeeName: string
  assignmentCount: number
  totalProducts: number
}

export interface CompleteAssignmentStats {
  totalAssignments: number
  assignmentsToday: number
  assignmentsThisMonth: number
  // totalProductsAssigned: number //no se usa, en su lugar: totalProductsAssignedThisMonthOrToday
  totalProductsAssignedThisMonthOrToday: number
  assignmentsByEmployee: AssignmentsByEmployee[]
  assignmentsByProductType: AssignmentsByProductType[]
  assignmentsByFamily: AssignmentsByFamily[]
  registrationsByDay: AssignmentRegistrationByDay[]
  // monthlyAssignments: any[], // Asignaciones específicas del mes
  assignmentDetails: any[], // Asignaciones específicas del mes
  registryAssignmentsYear?:number,
  totalProductsAssignedYear?:number,
}

export interface AssignmentReportDto {
  title: string
  value: any
  type: string
  date: string
  additionalInfo?: any
}
