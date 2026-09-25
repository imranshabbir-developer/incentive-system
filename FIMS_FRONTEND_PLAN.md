# FIMS Frontend Plan

**Product:** Finance Incentive Management System (IPS-USA)  
**Stack:** React + Vite (latest), role-based SPA  
**Companion file:** `FIMS_BACKEND_PLAN.md`  
**Requirements source:** `FIMS_CLIENT_REQUIREMENTS_MASTER.md` + `Finance_Incentive_Management_System_SRS.docx`  
**Rule:** Word SRS is the contract. Snapshot is visual intent only. No card number, CVV, expiry, or billing ZIP in any form, state, or payload.

This file is the **complete frontend build plan**, phase by phase. It does not skip a role, screen, report, status, field group, or later module from the SRS. It starts with the first step you asked for: **centered login + floating role bar + role dashboards + reporting section on every dashboard**.

---

## How to read this plan

| Term | Meaning |
|---|---|
| **Phase F1** | Your first step. Login, role quick-fill, six dashboards, reporting section on each. |
| **Phase F2–F6** | Remaining frontend, aligned to the SRS module order. |
| **Shell** | Screen exists, layout exists, filters exist, tables exist. Numbers may be dummy until the matching backend phase is live. |
| **Live** | Screen reads/writes the real API. |

The Word file said not to start from charts. You asked to start from login and dashboards anyway. This plan honors your first step. Dashboard **KPI numbers and report rows stay dummy in F1**. They become live when backend phases B2–B5 exist. Do not treat dummy tiles as finished product.

---

## Official roles (floating bar + routes)

Use SRS names, not the shorter snapshot labels.

| # | Role code | Display name on floating bar | After login go to |
|---|---|---|---|
| 1 | `SUPER_ADMIN` | Super Admin | `/admin/dashboard` |
| 2 | `HR` | HR | `/hr/dashboard` |
| 3 | `HOD` | HOD | `/hod/dashboard` |
| 4 | `FINANCE_USER` | Finance User | `/finance/dashboard` |
| 5 | `FINANCE_MANAGER` | Finance Manager | `/finance-manager/dashboard` |
| 6 | `EXECUTIVE` | Division Head / CFO / CEO | `/executive/dashboard` |

Six icons. Last one is the optional oversight role from the SRS (`Division Head / CFO / CEO`). Do not add a seventh icon unless Division Head, CFO, and CEO become three separate login roles later.

---

## Global frontend architecture

### App shape

```
frontend/
  package.json
  vite.config.js
  index.html
  src/
    main.jsx
    app/
      App.jsx
      router.jsx
      providers.jsx
    layouts/
      AuthLayout.jsx              # blank canvas for login
      AppShell.jsx                # sidebar + header + content
    features/
      auth/
        pages/LoginPage.jsx
        components/LoginForm.jsx
        components/RoleQuickFillBar.jsx
        api/auth.api.js
        store/auth.store.js
        guards/RequireAuth.jsx
        guards/RequireRole.jsx
      dashboards/
        pages/AdminDashboard.jsx
        pages/HrDashboard.jsx
        pages/HodDashboard.jsx
        pages/FinanceUserDashboard.jsx
        pages/FinanceManagerDashboard.jsx
        pages/ExecutiveDashboard.jsx
        components/KpiCard.jsx
        components/QueueList.jsx
        components/DashboardReportingSection.jsx
      reports/
        pages/ReportsHub.jsx
        pages/IncentiveRegisterPage.jsx
        pages/EmployeeIncentiveHistoryPage.jsx
        pages/DepartmentSummaryPage.jsx
        pages/HodSubmissionReportPage.jsx
        pages/PaymentReportPage.jsx
        components/ReportFilters.jsx
        components/ReportTable.jsx
        components/ExcelExportButton.jsx
      employees/
      departments/
      sales/
      incentives/
      finance-review/
      payroll/
      settings/
      notifications/
      audit/
    shared/
      api/http.js
      ui/                         # button, input, table, modal, badge
      constants/roles.js
      constants/statuses.js
      constants/incentive-types.js
      constants/payment-methods.js
      utils/money.js
      utils/period.js
    styles/
      tokens.css
      global.css
```

One feature folder per module. No single page that copies the four-column snapshot. NFR-05: each role sees only its menu and its data.

### Routing rules

- `/login` is public.
- Every other route is behind `RequireAuth`.
- Role home is behind `RequireRole` with that role only.
- Wrong role hitting another role URL → redirect to that user’s own dashboard. Do not show a forbidden page with another role’s numbers.
- Unknown route → role home.

### Sidebar by role (Finance Portal)

Show only what the role is allowed to open. Labels can follow the snapshot; screens behind them follow Appendix A.

| Menu item | Super Admin | HR | HOD | Finance User | Finance Manager | Executive |
|---|---|---|---|---|---|---|
| Dashboard | Yes | Yes | Yes | Yes | Yes | Yes |
| Employees | Yes | Yes | Team read-only later | No | No | No |
| Departments | Yes | Read later | No | No | No | No |
| Sales / Collections | Yes | No | Eligible read later | Yes | Yes | Oversight later |
| Incentive Requests | Yes | No | Yes | Yes | Yes | Oversight later |
| Approvals | Yes | No | No | Yes | Yes | Yes |
| Payroll | Yes | No | No | Yes | Yes | Oversight later |
| Reports | Yes | People reports only | **All 5 + Excel** | **All 5 + Excel** | **All 5 + Excel** | **All 5 + Excel** |
| Settings | Yes | No | No | No | Month lock later | No |
| Audit | Yes | No | No | No | Yes later | Yes later |

HR must **not** get screens that calculate or enter incentive money (SRS HR rule).

### Shared UI rules for every phase

- Currency display is formatted. Source money on HOD screens is read-only.
- Employee names are **selects from Employee Master**, never free-text inputs (FR-EMP-04, BR-10).
- No card-number field, no CVV field, no expiry field, no billing ZIP field, no card-shaped placeholder (AC-12, BR-12, SR-03).
- Payment method is a dropdown: PayPal, Zelle, ACH, Wire, Cheque, Other (FR-PAY-03).
- Collection payment status dropdown: Pending, Received, Verified, Cancelled, Refunded, Partially Refunded (FR-PAY-04). Never use “Paid” on a collection form.
- Incentive request statuses: Draft, Submitted, Under Finance Review, Returned, Resubmitted, Approved, Ready for Payment, Paid, Rejected, Cancelled.
- Incentive types: Sales, Closing, Account Management, Performance, SEO, Support, Special, Bonus, Adjustment, Other (FR-RULE-01).
- Return / Reject / Override / Adjustment always open a **mandatory reason** modal (BR-07, VC-08).
- Approved / paid amounts are not editable inputs. Correction is an Adjustment screen (FR-ADJ-01, FR-ADJ-02).
- HOD never sees another department (FR-AUTH-02, BR-02).

---

## Phase F1 — Login + role dashboards + reporting section

**This is the first coding step. Do this before any other frontend screen.**

Exit outcome: a person can open the app, click a role on the floating bar, see email and password filled, click Login, and land on that role’s dashboard. Every dashboard has KPIs, a work-queue area, and a Reporting section.

### F1.1 Login page layout

Full viewport. No app sidebar. No header menu.

1. Background is a quiet full-page canvas (IPS-USA / FIMS branding, not the four-column snapshot).
2. **Login card is centered both horizontally and vertically** (`display: flex; align-items: center; justify-content: center` on the viewport, or CSS grid place-center). The card itself is not full width.
3. On the login card:
   - Product name: Finance Incentive Management System
   - Organization: IPS-USA
   - Email input
   - Password input
   - Login button
   - Short security line: no card details are collected
4. **Vertical floating icon bar** sits beside the card (left of the card is the default). It is `position: fixed` or absolutely pinned to the vertical center of the viewport, not inside the card scroll. It does not sit in the page header.
5. The bar lists **all six roles**. Each item is:
   - an icon
   - the **role name written in full** (not initials only)
6. Clicking a role does **not** log in. It only writes that role’s demo email and password into the two inputs.
7. User then clicks **Login**.
8. Success → redirect to that role’s dashboard (table above).
9. Failure → error under the form. Stay on `/login`.

Demo quick-fill is a **local / demo aid**. Gate it with `import.meta.env.VITE_ENABLE_ROLE_QUICKFILL === 'true'`. When the flag is off, the floating bar is not rendered. Never ship the bar to a real production host.

### F1.2 Demo credentials the floating bar types

These are frontend constants used only when the quick-fill flag is on. Backend Phase B1 must seed the same users.

| Role on bar | Email typed | Password typed |
|---|---|---|
| Super Admin | `admin@fims.local` | `Admin@123` |
| HR | `hr@fims.local` | `Hr@123` |
| HOD | `hod.ce@fims.local` | `Hod@123` |
| Finance User | `finance.user@fims.local` | `Finance@123` |
| Finance Manager | `finance.manager@fims.local` | `Manager@123` |
| Division Head / CFO / CEO | `executive@fims.local` | `Exec@123` |

HOD demo user is scoped to Construction Estimation (CE) so later phases can run the RFAB example without changing login.

### F1.3 Login API contract the form uses

`POST /api/auth/login`  
Body: `{ email, password }`  
Success: `{ token, user: { id, name, email, role, departmentIds[] } }`  
Store token + user. Attach token on later calls.

F1 can run against the real B1 auth API. If backend is not up yet, a temporary local mock is allowed **only inside F1** and must be removed when B1 login works.

### F1.4 App shell after login

Every dashboard uses the same shell:

- Left sidebar (role-filtered menu from the table above)
- Top bar: product name, logged-in name, role badge, logout
- Main: dashboard content
- Footer line: IPS-USA | Finance Incentive Management System

Logout clears token and returns to `/login`.

### F1.5 Reporting section — required on every dashboard

Every dashboard page includes a block titled **Reporting**.

That block is not a later nice-to-have. It is part of F1.

Minimum content of the block on **every** role:

- Title: Reporting
- Period filter: month + year (default current month)
- Department filter:
  - HOD: locked to authorized department(s), not a free company-wide picker
  - HR: optional department, people reports only
  - Finance User, Finance Manager, Super Admin, Executive: all departments
- Shortcut cards / links into the five official Phase-1 reports
- A compact preview table (latest rows for the selected period)
- **Export to Excel** button on each report the role is allowed to open

The five official reports (SRS 9.1 / AC-11), every column listed:

| Report | Minimum filters / columns |
|---|---|
| **Incentive Register** | Month, Department, Employee, HOD, Status, Incentive Type, Amount |
| **Employee Incentive History** | Employee, period range, every incentive and payment status for that person |
| **Department Summary** | Department, Total Sales, Net Collections, Total Incentive, Incentive % |
| **HOD Submission Report** | HOD, Requests, Approved, Returned, Rejected, Pending |
| **Payment Report** | Approved, Ready for Payment, Paid, Unpaid |

**HOD dashboard** and **both Finance dashboards** (Finance User and Finance Manager) must expose **all five reports** plus Excel. Executive and Super Admin also get all five. HR gets **Employee master / eligibility / headcount** reports only, plus a disabled or hidden state for money reports so HR cannot calculate incentive amounts.

In F1 the preview tables may show dummy rows (including the Appendix B story: Brock Thompson, Addison Bruno, Mark Watson, INC-CE-2026-0045, CE, September 2026). Replace dummy rows when report APIs exist.

### F1.6 Super Admin dashboard (`/admin/dashboard`)

KPI tiles:

- Total users
- Total departments
- Total employees
- Active vs inactive employees
- Open audit events today

Work area:

- Shortcut cards: Users, Departments, Designations, Roles / Permissions, Incentive Plans, Settings, Audit log
- Recent audit list (dummy in F1)

Reporting section:

- All five official reports (company-wide)
- Extra admin preview: user/role access report (shell)

SRS jobs this dashboard must later support from this home: users, departments, designations, roles, permissions, incentive rules, approval workflows, settings, complete audit logs.

### F1.7 HR dashboard (`/hr/dashboard`)

KPI tiles:

- Total employees
- Active
- Notice Period
- Resigned
- Terminated
- Inactive
- Incentive-eligible vs not eligible

Work area:

- Shortcuts: Employee List, Add Employee, Employee Profile
- No “enter incentive amount” tile. Ever.

Reporting section:

- Employees by department
- Employees by status
- Incentive eligibility list
- Joining-date list
- **Do not** put Incentive Register / Payment Report / Department money summary here as working money tools

FR-EMP-01 fields the later employee screens must collect (do not skip any): Employee ID, name, designation, department, division, manager, HOD, joining date, employment status, location, shift, incentive eligibility.  
Statuses (FR-EMP-02): Active, Notice Period, Resigned, Terminated, Inactive.  
No physical delete when history exists (FR-EMP-03).

### F1.8 HOD dashboard (`/hod/dashboard`) — FR-HOD-01

KPI tiles, all required by the SRS, no tile skipped:

- Team members
- Eligible collections (verified + incentive-eligible)
- Draft
- Submitted
- Returned
- Approved
- Paid

Work area:

- My Requests
- New Request (sale-based)
- New Manual / Special Request (no sale — Software / IT path)
- Returned Requests
- Eligible collections list (read-only money)

Reporting section — **all five official reports**, department-scoped:

- Incentive Register
- Employee Incentive History
- Department Summary
- HOD Submission Report
- Payment Report
- Excel export on each

HOD never sees another department’s report rows.

### F1.9 Finance User dashboard (`/finance/dashboard`) — FR-FIN-06

KPI tiles, all required, no tile skipped:

- Pending review
- Returned
- Approved
- Ready for Payment
- Paid

Also show (needed for daily Finance work, not optional later):

- Unverified collections waiting
- Sales created this month
- Requests recommended / approved by this user

Work area:

- Review Queue
- Review Detail
- Sales / Collections
- Verify Payment
- Approved Requests
- Payment Batches (list, finalize is Manager)

Reporting section — **all five official reports**, company-wide, plus Excel.

Management numbers on this dashboard (SRS 9.2), as tiles or a small chart row. Dummy in F1, live in F5/F6:

- Total Collections This Month
- Total Incentives
- Incentive / Collection %
- Pending Requests
- Approved
- Paid
- Department-wise Incentives
- Top Incentive Categories
- Monthly Trend

### F1.10 Finance Manager dashboard (`/finance-manager/dashboard`)

KPI tiles:

- Waiting final approval
- Adjustments pending
- Batches in progress
- Batches finalized this month
- Ready for Payment
- Paid
- Month lock status (Unlocked / Locked)

Work area:

- Final approval queue
- Adjustments
- Payment Batches + Finalize
- Month lock / authorized reopen
- Reports hub

Reporting section — **all five official reports**, company-wide, Excel, plus the same SRS 9.2 management tiles as Finance User.

### F1.11 Executive dashboard (`/executive/dashboard`)

KPI tiles (oversight, not data entry):

- Total Collections This Month
- Total Incentives
- Incentive / Collection %
- Pending Requests
- Approved
- Paid
- Items waiting extra approval (threshold / department — empty until configured)

Work area:

- High-value / extra-approval queue (shell until FR-AUTH-04 is configured)
- Department-wise incentives
- Monthly trend

Reporting section — **all five official reports**, company-wide, Excel. No create-sale or create-request buttons.

### F1.12 F1 verification (do not call F1 done until these pass)

1. Login card is visually centered on large and small widths.
2. Floating bar is vertical, shows all six role names, and is not inside the card.
3. Click Super Admin → fields show `admin@fims.local` / `Admin@123`.
4. Click each other role → matching email and password from the table.
5. Click Login after each role → that role’s dashboard, not a generic page.
6. Direct URL to another role dashboard redirects home.
7. Logout returns to centered login.
8. Each of the six dashboards has a Reporting section.
9. HOD Reporting has all five report shortcuts.
10. Finance User Reporting has all five report shortcuts.
11. Finance Manager Reporting has all five report shortcuts.
12. HR Reporting has no working incentive-money calculator.
13. No card/CVV/expiry/ZIP field exists on login or dashboards.
14. Quick-fill bar disappears when `VITE_ENABLE_ROLE_QUICKFILL` is false.

---

## Phase F2 — Masters: departments, designations, dummy employees

Frontend for SRS Phase 1 remainder (after login). Backend B1/B2 masters must exist for live mode.

### F2.1 Department management (FR-DEPT-01, FR-DEPT-02)

Screens: Department list, Add/Edit Department.

Fields, none skipped: Department ID, Department Name, Division, HOD, Finance Reviewer, Active/Inactive.

Seed/list must be able to show, without a special CE-only schema: Construction Estimation, Medical Billing, Truck Dispatch, Digital Marketing, Software Development, IT, Hardware.

### F2.2 Designations

List + add/edit. Used on employee form and on HOD incentive lines (snapshot showed Designation).

### F2.3 Employee List / Add / Edit / Profile (FR-EMP-01 to FR-EMP-05)

HR + Super Admin write. HOD later gets team read-only.

Every FR-EMP-01 field on the form. Status dropdown is the five official statuses only. Save is create/update. Delete button is not a hard delete when history exists; status change only.

Employee pickers everywhere else (sales team, incentive lines) use this master.

Dummy people required so Appendix B can be shown later: Brock Thompson (Seller), Addison Bruno (Closer / Account Manager), Mark Watson (HOD CE), plus at least one Software and one IT employee who have **no sale**.

### F2.4 Super Admin user / role / permission screens

Create login users. Assign one of the six roles. Assign department scope for HOD (FR-AUTH-02). Permission matrix editor can be simple in F2 (role → screen allow list) and grow later (SR-07).

### F2.5 F2 verification

- HR can add an employee with every FR-EMP-01 field.
- Status can be set to Inactive and the row still appears in history/profile.
- Department list includes all seven named departments.
- HOD user cannot open another department’s employee set.

---

## Phase F3 — Sales / Collections screens

Frontend for SRS sales, collections, payments. Matches Appendix A: Sales List, Create Sale, Sale Detail, Add Payment, Verify Payment.

Finance User and Finance Manager (and Super Admin) can write. HOD does not create sales.

### F3.1 Create Sale / Sale Detail fields (FR-SALE-02 to FR-SALE-05, FR-COL-01, FR-COL-02)

None of these are optional on the form:

- Sale ID (system-generated, shown read-only after save)
- Date
- Client
- Company
- Project (support one sale → one project, and later one sale → multiple projects)
- Service
- Sale Type: New Client | Existing Client (FR-SALE-03). Snapshot “New” maps to New Client.
- Location
- Currency
- Total contract amount
- Invoice amount
- Collected amount (derived from payment children, not a second typed source if payments exist)
- Taxes / other charges
- Other deductions
- **Net collected = Collected − Tax/Other Charges − Other Deductions** (show calculated, do not let HOD type it)
- Team: Seller, Account Manager, Closer, optional Additional Contributor — each an employee select (FR-SALE-04)

**Do not** build First Payment and Second Payment as fixed fields. That snapshot layout is rejected by FR-PAY-01.

### F3.2 Add Payment (FR-PAY-01 to FR-PAY-06)

Repeating child rows on the sale:

- Payment ID
- Amount
- Payment date
- Payment method: PayPal, Zelle, ACH, Wire, Cheque, Other
- Status: Pending, Received, Verified, Cancelled, Refunded, Partially Refunded
- Fee
- Net amount
- Transaction / reference

No card number, CVV, expiry, billing ZIP.

Uncollected amount, if shown, is derived (contract/invoice minus collected). Not a stored second truth.

### F3.3 Verify Payment

Finance action: change a payment to **Verified** (or reject path via Cancelled / Refunded). Only Verified collections appear later in the HOD sale-based picker (FR-PAY-05, BR-03).

### F3.4 Excel import screen (FR-SALE-01)

Upload + column map + preview + commit. Final Excel layout is still an open client item. Build a mapper, do not hardcode one unofficial sheet as the only format.

### F3.5 F3 verification

- A sale can have three payments, not two slots.
- One payment can be Verified while another stays Received.
- Net collected follows the formula.
- HOD cannot edit these screens.

---

## Phase F4 — HOD incentive request screens

Appendix A: My Requests, New Request, Request Detail, Returned Requests.  
Also Manual / Special (FR-MAN-01 to FR-MAN-03), which the snapshot omitted and the SRS still requires.

### F4.1 New sale-based request (FR-HOD-02 to FR-HOD-07)

1. Select period (month/year).
2. Select authorized department only.
3. Select from **verified, incentive-eligible** collections only.
4. After select, show **read-only**: client, company, project, service, sale type, linked employees, contract amount, collection, deductions, net collection, payment date.
5. Suggest employees linked to the sale.
6. HOD can add/remove eligible employees.
7. Per line: employee (select), designation (display), incentive type, amount (manual in this phase), comments.
8. Additional comments.
9. Total incentive (sum of lines).
10. **Save Draft** and **Submit to Finance**.
11. After submit, show request ID `INC-{Department}-{Year}-{Sequence}` (example INC-CE-2026-0045).

HOD cannot edit Finance-verified source money (FR-AUTH-03 / AC-04).

### F4.2 New Manual / Special request (Software / IT and any non-sale policy)

No collection picker.

Required: period, department, employee select(s), incentive type (Performance, Bonus, Special, Support, Other, …), amount, **reason**, supporting comments, **attachment**.

This is how Software / IT records reach Finance. There is no sales form for them unless they actually have a sale.

### F4.3 My Requests / Returned / Detail

List by status. Returned items editable again, then Resubmit. Approved items are read-only (FR-AUTH-03).

### F4.4 F4 verification (AC-03, AC-04, AC-05)

- HOD sees only authorized verified eligible collections.
- Source block is not editable.
- Draft saves. Submit creates INC- id.
- Manual request refuses submit without reason + attachment.
- Software dummy employee can be put on a special request with no sale.

---

## Phase F5 — Finance review, approvals, adjustments

Appendix A: Review Queue, Review Detail, Approved Requests.

### F5.1 Review Detail (FR-FIN-01 to FR-FIN-05)

Show every FR-FIN-02 field: request number, department, HOD, period, submission date, total incentive, sale/collection details (or “Manual / Special — no sale”), employee incentive items.

System checklist must show the **SRS checks**, not only the snapshot’s five ticks:

- Employee exists
- Employee active / eligible
- Sale exists (if sale-based)
- Payment is **Verified** (not merely Received)
- Net collection > 0 (sale-based)
- Applicable plan or permitted manual process
- No duplicate (Sale + Payment + Employee + Incentive Type)
- Correct department
- Correct period

Actions: **Approve**, **Return to HOD**, **Reject**. Return and Reject open a required-reason modal. Duplicate warning is blocking (FR-DUP-02). Admin override, if shown, requires reason (FR-DUP-03).

### F5.2 Finance Manager extra screens

Final approval of Finance-verified items. Approve adjustments. No direct edit of approved/paid money.

### F5.3 Adjustment screen (FR-ADJ-01 to FR-ADJ-03)

New row linked to original request/item. Original values stay visible. Reason required.

### F5.4 Extra approval queue (FR-AUTH-04, FR-MAN-03)

Executive / configured higher level. Hidden or empty until thresholds are configured. Do not invent amounts.

### F5.5 F5 verification (AC-06, AC-07, AC-09)

- Unverified payment cannot be approved on a sale-based request.
- Ineligible employee is flagged.
- Duplicate is blocked with a visible warning.
- Return without reason cannot submit.
- Approved request has no edit fields for HOD or Finance User.

---

## Phase F6 — Payroll batches, month lock, live reports, Excel

Appendix A: Payment Batches, Reports / Export.

### F6.1 Payment batch screens (FR-BAT-01 to FR-BAT-06)

- Create monthly batch from Approved items
- Totals by department and overall
- Employee monthly total across types + adjustments
- Finance Manager **Finalize**
- After finalize, fields locked (FR-BAT-04)
- Status moves Ready for Payment → Paid (FR-BAT-05)

### F6.2 Month lock (FR-LOCK-01, FR-LOCK-02)

Finance Manager lock control. Locked month blocks normal edits. Reopen is a separate authorized action with reason.

### F6.3 Reports go live

Replace F1 dummy tables with API data. Keep the same five reports and the same filters. Excel export for register and basic reports is required (SRS 9.3, AC-11).

HOD reports remain department-scoped. Finance User, Finance Manager, Super Admin, Executive remain company-wide (or permission-scoped).

### F6.4 F6 verification (AC-08, AC-11)

- Approved request appears in a September-style batch and can become Paid.
- Register, employee history, department summary, HOD submission, payment report all render from API.
- Excel downloads open with the same columns.
- Locked month rejects edit attempts in the UI.

---

## Phase F7 — Rules engine UI, notifications, advanced dashboard, audit

SRS Phase 6 on the frontend. Do not start this before F4–F6 work.

### F7.1 Incentive plans / rules screens (FR-RULE-01 to FR-RULE-06)

Plan fields, none skipped: Plan Name, Department, Sale Type, Employee Role, Calculation Basis, Percentage / Fixed Amount, Minimum Collection, Maximum Incentive, Effective From, Effective To, Status.

Must be able to represent, without a CE-only form:

- Digital Marketing: First Collection, Qualified Leads, Conversions, Project Performance, SEO Members, Manager, Division Head
- Medical Billing: collection, new client, implementation, performance-based

Phase F4 amounts stay manual until this phase auto-fills from rules (FR-RULE-03).

### F7.2 Multi-level approval settings

Department and/or amount threshold (FR-AUTH-04). Values come from configuration, not hardcoded policy.

### F7.3 Notifications UI

In-app bell for:

- HOD submits → Finance
- Finance returns → HOD
- Approve → relevant users
- Batch / payment processed → relevant users

Email templates are backend. Frontend only shows the in-app list and read state. Email body must not be designed as a full money dump; link to the record.

### F7.4 Advanced management dashboard

Turn the F1/F5 chart shells into live charts: department-wise incentives, top categories, monthly trend.

### F7.5 Audit screens (SR-05, SR-07, AC-10)

Table: user, action, entity, old value, new value, date/time, reason, optional IP/session. Permission-gated. Super Admin sees all. Others as configured.

---

## Full screen inventory (do not drop any)

| Area | Screen | First appears | Live data |
|---|---|---|---|
| General | Login (centered + floating role bar) | F1 | F1 / B1 |
| General | Role dashboards × 6 + Reporting section | F1 | F1 dummy → F6 live |
| Employees | Employee List | F2 | F2 |
| Employees | Add/Edit Employee | F2 | F2 |
| Employees | Employee Profile | F2 | F2 |
| Departments | Department management | F2 | F2 |
| Admin | Users, roles, permissions | F2 | F2 |
| Sales | Sales List | F3 | F3 |
| Sales | Create Sale | F3 | F3 |
| Sales | Sale Detail | F3 | F3 |
| Sales | Add Payment | F3 | F3 |
| Sales | Verify Payment | F3 | F3 |
| Sales | Excel import | F3 | F3 |
| Incentives | My Requests | F4 | F4 |
| Incentives | New Request (sale-based) | F4 | F4 |
| Incentives | New Manual / Special | F4 | F4 |
| Incentives | Request Detail | F4 | F4 |
| Incentives | Returned Requests | F4 | F4 |
| Finance | Review Queue | F5 | F5 |
| Finance | Review Detail | F5 | F5 |
| Finance | Approved Requests | F5 | F5 |
| Finance | Adjustment | F5 | F5 |
| Finance | Extra approval queue | F5 shell / F7 live | F7 |
| Payroll | Payment Batches | F6 | F6 |
| Payroll | Month lock | F6 | F6 |
| Reports | All 5 official reports + Excel | F1 shell | F6 |
| Admin | Settings | F2 / F7 | F7 |
| Admin | Incentive plans / rules | F7 | F7 |
| Admin | Notifications | F7 | F7 |
| Admin | Audit | F7 | F7 |

---

## Frontend phase → backend phase map

| Frontend | Needs backend | If backend is late |
|---|---|---|
| F1 login | B1 `POST /api/auth/login` | Temporary mock, then delete |
| F1 dashboard KPIs + reports | B1 summary + B5/B6 reports | Dummy JSON in F1 only |
| F2 employees / departments | B1 masters | Do not invent a second employee model |
| F3 sales / payments | B2 | Screens disabled or empty |
| F4 HOD requests | B3 | Screens disabled |
| F5 review | B4 | Screens disabled |
| F6 batches / live reports | B5 | Keep F1 dummy banner until live |
| F7 rules / notify / audit UI | B6 | Hidden from menu |

---

## F1 build order (when you say start coding)

1. Vite React app + folders above.  
   Verify: app runs, blank route works.
2. Auth layout + centered login card.  
   Verify: card is mid-page both axes.
3. Vertical floating role bar + six named roles + field fill.  
   Verify: each click fills the matching email and password.
4. Login submit + token store + role redirect.  
   Verify: six logins, six different dashboards.
5. App shell + role sidebar.  
   Verify: HR does not see Sales; HOD does not see Settings.
6. Six dashboards with the KPI lists in F1.6–F1.11.  
   Verify: HOD has the seven FR-HOD-01 counts; Finance User has the five FR-FIN-06 counts.
7. Reporting section on all six dashboards; all five reports on HOD + both Finance roles.  
   Verify: F1.12 checklist.

Stop after F1 until you say to continue. Do not build Create Sale in the same breath as the login card.
