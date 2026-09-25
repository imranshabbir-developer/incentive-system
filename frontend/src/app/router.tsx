import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth/LoginPage'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { RequireRole } from '@/features/auth/RequireRole'
import { FinanceLoader } from '@/features/auth/FinanceLoader'
import { AppShell } from '@/layouts/AppShell'
import type { Role } from '@/shared/types'

const AdminDashboard = lazy(() => import('@/features/dashboards/dashboards').then((m) => ({ default: m.AdminDashboard })))
const HrDashboard = lazy(() => import('@/features/dashboards/dashboards').then((m) => ({ default: m.HrDashboard })))
const HodDashboard = lazy(() => import('@/features/dashboards/dashboards').then((m) => ({ default: m.HodDashboard })))
const FinanceUserDashboard = lazy(() => import('@/features/dashboards/dashboards').then((m) => ({ default: m.FinanceUserDashboard })))
const FinanceManagerDashboard = lazy(() => import('@/features/dashboards/dashboards').then((m) => ({ default: m.FinanceManagerDashboard })))
const ExecutiveDashboard = lazy(() => import('@/features/dashboards/dashboards').then((m) => ({ default: m.ExecutiveDashboard })))
const EmployeesWorkspace = lazy(() => import('@/features/pages/EmployeesWorkspace').then((m) => ({ default: m.EmployeesWorkspace })))
const DepartmentsWorkspace = lazy(() => import('@/features/pages/DepartmentsWorkspace').then((m) => ({ default: m.DepartmentsWorkspace })))
const UsersWorkspace = lazy(() => import('@/features/pages/UsersWorkspace').then((m) => ({ default: m.UsersWorkspace })))
const SalesWorkspace = lazy(() => import('@/features/pages/SalesWorkspace').then((m) => ({ default: m.SalesWorkspace })))
const PayrollWorkspace = lazy(() => import('@/features/pages/PayrollWorkspace').then((m) => ({ default: m.PayrollWorkspace })))
const SettingsWorkspace = lazy(() => import('@/features/pages/SettingsWorkspace').then((m) => ({ default: m.SettingsWorkspace })))
const AuditWorkspace = lazy(() => import('@/features/pages/AuditWorkspace').then((m) => ({ default: m.AuditWorkspace })))
const DesignationsWorkspace = lazy(() => import('@/features/pages/DesignationsWorkspace').then((m) => ({ default: m.DesignationsWorkspace })))
const PlansWorkspace = lazy(() => import('@/features/pages/PlansWorkspace').then((m) => ({ default: m.PlansWorkspace })))
const ExtraApprovalsWorkspace = lazy(() => import('@/features/pages/ExtraApprovalsWorkspace').then((m) => ({ default: m.ExtraApprovalsWorkspace })))
const IncentivesPage = lazy(() => import('@/features/incentives/IncentivesPage').then((m) => ({ default: m.IncentivesPage })))
const SaleRequestPage = lazy(() => import('@/features/incentives/SaleRequestPage').then((m) => ({ default: m.SaleRequestPage })))
const ManualRequestPage = lazy(() => import('@/features/incentives/ManualRequestPage').then((m) => ({ default: m.ManualRequestPage })))
const RequestDetailPage = lazy(() => import('@/features/incentives/RequestDetailPage').then((m) => ({ default: m.RequestDetailPage })))
const ReportsHub = lazy(() => import('@/features/reports/ReportsHub').then((m) => ({ default: m.ReportsHub })))
const ReportPage = lazy(() => import('@/features/reports/ReportPage').then((m) => ({ default: m.ReportPage })))

function Boot({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FinanceLoader label="Loading finance workspace" />}>{children}</Suspense>
}

function roleBlock(path: string, role: Role, dashboard: ReactNode) {
  return (
    <Route path={path} element={<RequireRole role={role} />}>
      <Route element={<AppShell />}>
        <Route path="dashboard" element={<Boot>{dashboard}</Boot>} />
        <Route path="employees" element={<Boot><EmployeesWorkspace /></Boot>} />
        <Route path="departments" element={<Boot><DepartmentsWorkspace /></Boot>} />
        <Route path="designations" element={<Boot><DesignationsWorkspace /></Boot>} />
        <Route path="plans" element={<Boot><PlansWorkspace /></Boot>} />
        <Route path="users" element={<Boot><UsersWorkspace /></Boot>} />
        <Route path="extra-approvals" element={<Boot><ExtraApprovalsWorkspace /></Boot>} />
        <Route path="sales" element={<Boot><SalesWorkspace /></Boot>} />
        <Route path="incentives/new-sale" element={<Boot><SaleRequestPage /></Boot>} />
        <Route path="incentives/new-manual" element={<Boot><ManualRequestPage /></Boot>} />
        <Route path="incentives/:requestId/edit" element={<Boot><SaleRequestPage /></Boot>} />
        <Route path="incentives/:requestId" element={<Boot><RequestDetailPage /></Boot>} />
        <Route path="incentives" element={<Boot><IncentivesPage /></Boot>} />
        <Route path="approvals" element={<Boot><IncentivesPage mode="queue" /></Boot>} />
        <Route path="payroll" element={<Boot><PayrollWorkspace /></Boot>} />
        <Route path="settings" element={<Boot><SettingsWorkspace /></Boot>} />
        <Route path="audit" element={<Boot><AuditWorkspace /></Boot>} />
        <Route path="reports" element={<Boot><ReportsHub /></Boot>} />
        <Route path="reports/:reportId" element={<Boot><ReportPage /></Boot>} />
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Route>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          {roleBlock('admin', 'SUPER_ADMIN', <AdminDashboard />)}
          {roleBlock('hr', 'HR', <HrDashboard />)}
          {roleBlock('hod', 'HOD', <HodDashboard />)}
          {roleBlock('finance', 'FINANCE_USER', <FinanceUserDashboard />)}
          {roleBlock('finance-manager', 'FINANCE_MANAGER', <FinanceManagerDashboard />)}
          {roleBlock('executive', 'EXECUTIVE', <ExecutiveDashboard />)}
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
