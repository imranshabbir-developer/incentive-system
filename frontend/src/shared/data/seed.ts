export const departments = [
  { id: 'dept-ce', code: 'CE', name: 'Construction Estimation', hod: 'Mark Watson', reviewer: 'Daniel Cruz', status: 'Active', division: 'Operations' },
  { id: 'dept-mb', code: 'MB', name: 'Medical Billing', hod: 'Lisa Grant', reviewer: 'Daniel Cruz', status: 'Active', division: 'Operations' },
  { id: 'dept-td', code: 'TD', name: 'Truck Dispatch', hod: 'Omar Reed', reviewer: 'Sara Khan', status: 'Active', division: 'Operations' },
  { id: 'dept-dm', code: 'DM', name: 'Digital Marketing', hod: 'Priya Shah', reviewer: 'Daniel Cruz', status: 'Active', division: 'Growth' },
  { id: 'dept-sd', code: 'SD', name: 'Software Development', hod: 'Kevin Cole', reviewer: 'Sara Khan', status: 'Active', division: 'Technology' },
  { id: 'dept-it', code: 'IT', name: 'IT', hod: 'Hina Ali', reviewer: 'Daniel Cruz', status: 'Active', division: 'Technology' },
  { id: 'dept-hw', code: 'HW', name: 'Hardware', hod: 'Ben Ortiz', reviewer: 'Sara Khan', status: 'Active', division: 'Operations' },
]

export const employees = [
  { id: 'EMP-1001', name: 'Brock Thompson', designation: 'Seller', department: 'Construction Estimation', departmentId: 'dept-ce', division: 'Operations', manager: 'Mark Watson', hod: 'Mark Watson', joiningDate: '2023-04-12', status: 'Active', location: 'Texas', shift: 'Day', eligible: 'Yes' },
  { id: 'EMP-1002', name: 'Addison Bruno', designation: 'Closer', department: 'Construction Estimation', departmentId: 'dept-ce', division: 'Operations', manager: 'Mark Watson', hod: 'Mark Watson', joiningDate: '2022-11-03', status: 'Active', location: 'Texas', shift: 'Day', eligible: 'Yes' },
  { id: 'EMP-1003', name: 'Mark Watson', designation: 'HOD', department: 'Construction Estimation', departmentId: 'dept-ce', division: 'Operations', manager: 'James Porter', hod: 'Mark Watson', joiningDate: '2019-01-20', status: 'Active', location: 'Texas', shift: 'Day', eligible: 'Yes' },
  { id: 'EMP-1004', name: 'Farah Aziz', designation: 'Software Engineer', department: 'Software Development', departmentId: 'dept-sd', division: 'Technology', manager: 'Kevin Cole', hod: 'Kevin Cole', joiningDate: '2024-02-01', status: 'Active', location: 'Remote', shift: 'Day', eligible: 'Yes' },
  { id: 'EMP-1005', name: 'Leo Martins', designation: 'IT Support', department: 'IT', departmentId: 'dept-it', division: 'Technology', manager: 'Hina Ali', hod: 'Hina Ali', joiningDate: '2021-08-16', status: 'Active', location: 'Dallas', shift: 'Evening', eligible: 'Yes' },
  { id: 'EMP-1006', name: 'Nina Patel', designation: 'SEO Specialist', department: 'Digital Marketing', departmentId: 'dept-dm', division: 'Growth', manager: 'Priya Shah', hod: 'Priya Shah', joiningDate: '2023-09-08', status: 'Notice Period', location: 'Austin', shift: 'Day', eligible: 'Yes' },
  { id: 'EMP-1007', name: 'Chris Young', designation: 'Dispatcher', department: 'Truck Dispatch', departmentId: 'dept-td', division: 'Operations', manager: 'Omar Reed', hod: 'Omar Reed', joiningDate: '2020-05-11', status: 'Inactive', location: 'Houston', shift: 'Night', eligible: 'No' },
  { id: 'EMP-1008', name: 'Rita Gomez', designation: 'Billing Specialist', department: 'Medical Billing', departmentId: 'dept-mb', division: 'Operations', manager: 'Lisa Grant', hod: 'Lisa Grant', joiningDate: '2022-03-14', status: 'Active', location: 'Florida', shift: 'Day', eligible: 'Yes' },
  { id: 'EMP-1009', name: 'Tom Hale', designation: 'Hardware Technician', department: 'Hardware', departmentId: 'dept-hw', division: 'Operations', manager: 'Ben Ortiz', hod: 'Ben Ortiz', joiningDate: '2023-06-01', status: 'Active', location: 'Dallas', shift: 'Day', eligible: 'Yes' },
]

export const PERIODS = [
  'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026',
  'July 2026', 'August 2026', 'September 2026', 'October 2026', 'November 2026', 'December 2026',
]

export const LOCATIONS = ['Texas', 'Florida', 'Ohio', 'Dallas', 'Austin', 'Houston', 'Remote']
export const CURRENCIES = ['USD', 'PKR']
export const EMPLOYEE_STATUSES = ['Active', 'Notice Period', 'Resigned', 'Terminated', 'Inactive']
export const SHIFTS = ['Day', 'Evening', 'Night']
export const PAYMENT_METHODS = ['PayPal', 'Zelle', 'ACH', 'Wire', 'Cheque', 'Other']
export const PAYMENT_STATUSES = ['Pending', 'Received', 'Verified', 'Cancelled', 'Refunded', 'Partially Refunded']
export const REQUEST_STATUSES = ['Draft', 'Submitted', 'Under Finance Review', 'Returned', 'Resubmitted', 'Approved', 'Ready for Payment', 'Paid', 'Rejected', 'Cancelled']

export function departmentOptions(rows: Array<{ name: string; status?: string }> = [], extra?: { value: string; label: string }) {
  const byName = new Map<string, { value: string; label: string }>()
  for (const row of departments) {
    if (row.status !== 'Inactive') byName.set(row.name, { value: row.name, label: row.name })
  }
  for (const row of rows) {
    if (row.status !== 'Inactive') byName.set(row.name, { value: row.name, label: row.name })
  }
  const names = [...byName.values()]
  return extra ? [extra, ...names] : names
}

export function periodOptions() {
  return PERIODS.map((value) => ({ value, label: value }))
}

export const sales = [
  { id: 'SALE-2045', date: '2026-09-15', client: 'Vincent Logozzo', company: 'De Colores Industrial LLC', project: 'RFAB Weather Hardening', service: 'Shop Drawings', saleType: 'New Client', location: 'Texas', currency: 'USD', contract: 4650, invoice: 4650, collected: 2775, net: 2680.64, status: 'Verified', department: 'Construction Estimation', tax: 80, other: 14.36 },
  { id: 'SALE-2048', date: '2026-09-20', client: 'Marina Cole', company: 'Cole Fabrication', project: 'RFAB Canopy Steel', service: 'Shop Drawings', saleType: 'Existing Client', location: 'Texas', currency: 'USD', contract: 3200, invoice: 3200, collected: 1600, net: 1540, status: 'Verified', department: 'Construction Estimation', tax: 50, other: 10 },
  { id: 'SALE-2046', date: '2026-09-18', client: 'Helena Ortiz', company: 'Northline Medical', project: 'Claims Sprint', service: 'Implementation', saleType: 'Existing Client', location: 'Florida', currency: 'USD', contract: 9200, invoice: 9200, collected: 3100, net: 2980, status: 'Received', department: 'Medical Billing', tax: 100, other: 20 },
  { id: 'SALE-2047', date: '2026-09-21', client: 'Qasim Riaz', company: 'BluePeak Freight', project: 'Lane Setup', service: 'Dispatch Desk', saleType: 'New Client', location: 'Ohio', currency: 'USD', contract: 5400, invoice: 5400, collected: 0, net: 0, status: 'Pending', department: 'Truck Dispatch', tax: 0, other: 0 },
]

export const saleEmployees = [
  { saleId: 'SALE-2045', employeeId: 'EMP-1001', name: 'Brock Thompson', role: 'Seller' },
  { saleId: 'SALE-2045', employeeId: 'EMP-1002', name: 'Addison Bruno', role: 'Closer' },
  { saleId: 'SALE-2048', employeeId: 'EMP-1001', name: 'Brock Thompson', role: 'Seller' },
  { saleId: 'SALE-2048', employeeId: 'EMP-1002', name: 'Addison Bruno', role: 'Account Manager' },
]

export const payments = [
  { id: 'PAY-9001', saleId: 'SALE-2045', amount: 2775, date: '2026-09-15', method: 'Zelle', status: 'Verified', fee: 94.36, net: 2680.64, reference: 'ZL-88421' },
  { id: 'PAY-9004', saleId: 'SALE-2048', amount: 1600, date: '2026-09-20', method: 'ACH', status: 'Verified', fee: 60, net: 1540, reference: 'ACH-2048' },
  { id: 'PAY-9002', saleId: 'SALE-2046', amount: 3100, date: '2026-09-18', method: 'ACH', status: 'Received', fee: 120, net: 2980, reference: 'ACH-10211' },
  { id: 'PAY-9003', saleId: 'SALE-2047', amount: 1800, date: '2026-09-22', method: 'Wire', status: 'Pending', fee: 0, net: 0, reference: 'WIRE-HOLD' },
]

export const INCENTIVE_TYPES = ['Sales', 'Closing', 'Account Management', 'Performance', 'SEO', 'Support', 'Special', 'Bonus', 'Adjustment', 'Other'] as const

export const incentiveRequests = [
  { id: 'INC-CE-2026-0045', department: 'Construction Estimation', hod: 'Mark Watson', month: 'September 2026', submitted: '2026-10-01', total: 250, status: 'Approved', type: 'Sales', saleId: 'SALE-2045' },
  { id: 'INC-CE-2026-0046', department: 'Construction Estimation', hod: 'Mark Watson', month: 'September 2026', submitted: '2026-10-02', total: 180, status: 'Returned', type: 'Closing', saleId: 'SALE-2045' },
  { id: 'INC-SD-2026-0012', department: 'Software Development', hod: 'Kevin Cole', month: 'September 2026', submitted: '2026-10-03', total: 300, status: 'Submitted', type: 'Performance', saleId: '—' },
  { id: 'INC-IT-2026-0008', department: 'IT', hod: 'Hina Ali', month: 'September 2026', submitted: '2026-10-03', total: 120, status: 'Draft', type: 'Special', saleId: '—' },
]

export const incentiveItems = [
  { requestId: 'INC-CE-2026-0045', employee: 'Brock Thompson', department: 'CE', hod: 'Mark Watson', type: 'Sales', amount: 150, status: 'Approved', month: 'September 2026' },
  { requestId: 'INC-CE-2026-0045', employee: 'Addison Bruno', department: 'CE', hod: 'Mark Watson', type: 'Sales', amount: 100, status: 'Approved', month: 'September 2026' },
  { requestId: 'INC-CE-2026-0046', employee: 'Addison Bruno', department: 'CE', hod: 'Mark Watson', type: 'Closing', amount: 180, status: 'Returned', month: 'September 2026' },
  { requestId: 'INC-SD-2026-0012', employee: 'Farah Aziz', department: 'SD', hod: 'Kevin Cole', type: 'Performance', amount: 300, status: 'Submitted', month: 'September 2026' },
]

export const auditLogs = [
  { id: 'AUD-1', user: 'Daniel Cruz', action: 'Verified payment', entity: 'PAY-9001', oldValue: 'Received', newValue: 'Verified', at: '2026-09-16 09:12', reason: 'Collection confirmed' },
  { id: 'AUD-2', user: 'Mark Watson', action: 'Submitted request', entity: 'INC-CE-2026-0045', oldValue: 'Draft', newValue: 'Submitted', at: '2026-10-01 14:20', reason: 'September verified collection' },
  { id: 'AUD-3', user: 'Sara Khan', action: 'Approved request', entity: 'INC-CE-2026-0045', oldValue: 'Under Finance Review', newValue: 'Approved', at: '2026-10-02 11:05', reason: 'Policy matched, no duplicate' },
]

export const monthlyTrend = [
  { month: 'Jan', collections: 42, incentives: 18 },
  { month: 'Feb', collections: 48, incentives: 20 },
  { month: 'Mar', collections: 51, incentives: 22 },
  { month: 'Apr', collections: 46, incentives: 19 },
  { month: 'May', collections: 62, incentives: 28 },
  { month: 'Jun', collections: 58, incentives: 24 },
  { month: 'Jul', collections: 64, incentives: 26 },
  { month: 'Aug', collections: 70, incentives: 30 },
  { month: 'Sep', collections: 77, incentives: 34 },
  { month: 'Oct', collections: 40, incentives: 12 },
  { month: 'Nov', collections: 0, incentives: 0 },
  { month: 'Dec', collections: 0, incentives: 0 },
]

export const departmentIncentives = [
  { name: 'CE', value: 430 },
  { name: 'MB', value: 210 },
  { name: 'DM', value: 180 },
  { name: 'SD', value: 300 },
  { name: 'IT', value: 120 },
  { name: 'TD', value: 90 },
  { name: 'HW', value: 60 },
]

export const categoryShare = [
  { name: 'Sales', value: 46, color: '#22c55e' },
  { name: 'Performance', value: 22, color: '#86efac' },
  { name: 'Special', value: 18, color: '#f97316' },
  { name: 'Bonus', value: 14, color: '#d1d5db' },
]

export const spark = [12, 14, 13, 18, 16, 21, 19, 24, 22, 28, 26, 30]
export const sparkDown = [20, 19, 18, 17, 18, 16, 15, 14, 13, 14, 12, 11]
