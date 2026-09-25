# FIMS Backend Plan

**Product:** Finance Incentive Management System (IPS-USA)  
**Stack:** Node.js + Express + PostgreSQL  
**Companion file:** `FIMS_FRONTEND_PLAN.md`  
**Requirements source:** `FIMS_CLIENT_REQUIREMENTS_MASTER.md` + `Finance_Incentive_Management_System_SRS.docx`  
**Rule:** Word SRS is the contract. No card number, CVV, expiry, or billing ZIP in any table, column, DTO, log, or export. Employee API comes later; start with dummy employees behind one repository.

This file is the **complete backend build plan**, phase by phase. It does not skip a listed entity, status, validation, report, notification event, or acceptance criterion. It starts with the first step you asked for: **login that returns a role, plus dashboard and report payloads for every role**.

---

## How to read this plan

| Term | Meaning |
|---|---|
| **Phase B1** | Auth, roles, seed users, departments, dummy employees, dashboard summary APIs, report APIs that may return seed/dummy rows. |
| **Phase B2–B6** | Remaining backend, aligned to the SRS module order. |
| **Must validate on the server** | UI checklists are not enough (FR-FIN-03, VC-01–VC-09). |

Frontend Phase F1 calls B1 login + B1 dashboard/report endpoints. Later frontend phases call the matching B2–B6 APIs.

---

## Official roles the API must know

| Role code | Seed email | Seed password | Home the API should name |
|---|---|---|---|
| `SUPER_ADMIN` | `admin@fims.local` | `Admin@123` | `/admin/dashboard` |
| `HR` | `hr@fims.local` | `Hr@123` | `/hr/dashboard` |
| `HOD` | `hod.ce@fims.local` | `Hod@123` | `/hod/dashboard` |
| `FINANCE_USER` | `finance.user@fims.local` | `Finance@123` | `/finance/dashboard` |
| `FINANCE_MANAGER` | `finance.manager@fims.local` | `Manager@123` | `/finance-manager/dashboard` |
| `EXECUTIVE` | `executive@fims.local` | `Exec@123` | `/executive/dashboard` |

Passwords are stored **hashed**. Seed passwords exist so the frontend floating bar can type them. Do not return the password from any API. Do not expose a public “list demo passwords” endpoint.

HOD seed user is scoped to Construction Estimation only (FR-AUTH-02).

---

## Global backend architecture

### App shape

```
backend/
  package.json
  .env
  src/
    server.js
    app.js
    config/
      env.js
      db.js
    db/
      migrations/
      seeds/
    modules/
      auth/
      users/
      roles/
      departments/
      designations/
      employees/          # dummy now, swap source later
      clients/
      projects/
      services/
      sales/
      payments/           # client collections, not payroll
      incentives/
      approvals/
      adjustments/
      payroll/            # employee payout batches
      reports/
      notifications/
      audit/
      settings/
    shared/
      middleware/auth.js
      middleware/rbac.js
      middleware/scopeHod.js
      middleware/error.js
      middleware/validate.js
      utils/money.js
      utils/period.js
      utils/requestId.js  # INC-{DEPT}-{YEAR}-{SEQ}
    jobs/                 # later: email, month lock helpers
  tests/
```

Modular monolith. One module per SRS domain. Do not start as microservices.

### Cross-cutting rules for every phase

- Every money write is authenticated and role-checked (SR-01, FR-AUTH-01).
- HOD queries are forced through department scope (SR-02, FR-AUTH-02, BR-02). Never trust `departmentId` from the body if it is not in the user’s `departmentIds`.
- HR cannot write incentive amounts or approve money.
- Approved / paid financial rows are not updated in place. Use `incentive_adjustments` (FR-ADJ-01, FR-ADJ-02, SR-06, BR-05, BR-06).
- Employees with history are not physically deleted (FR-EMP-03).
- Duplicate sale-based incentive: unique on `(sale_id, payment_id, employee_id, incentive_type)` among non-rejected/non-cancelled rows (FR-DUP-01).
- Card-shaped columns are forbidden: no `card_number`, `cvv`, `expiry`, `billing_zip`, `card_last4` used as a card store (SR-03, FR-PAY-06, BR-12, AC-12). Allowed collection metadata only: method, status, date, transaction/reference, fee, net amount (SR-04, FR-PAY-02).
- Audit every material action: user, action, entity, old value, new value, date/time, reason; IP/session optional until the client decides (SR-05, BR-08).
- Source commercial figures are referenced by ID, not copied as a second editable truth (FR-COL-03, BR-11).
- `Net Collected = Collected − Tax/Other Charges − Other Deductions` (FR-COL-02). Compute on write and on read.
- Two payment objects stay in two tables: `payments` (client → company) and `payment_batches` / `payment_batch_items` (company → employee).

### 24 entities the SRS named — create them by the phase shown, none dropped

| # | Entity | First migration phase | Purpose |
|---|---|---|---|
| 1 | `users` | B1 | Login accounts |
| 2 | `employees` | B1 | Employee Master (dummy source) |
| 3 | `departments` | B1 | Department Master |
| 4 | `designations` | B1 | Titles |
| 5 | `roles` | B1 | The six roles |
| 6 | `permissions` | B1 | Screen / action allow list |
| 7 | `employee_reporting` | B1 | Manager / HOD links |
| 8 | `clients` | B2 | Sale client |
| 9 | `projects` | B2 | Sale project(s) |
| 10 | `services` | B2 | Service catalog |
| 11 | `sales` | B2 | Commercial deal |
| 12 | `sale_employees` | B2 | Seller, Closer, AM, Additional Contributor |
| 13 | `payments` | B2 | Client collection rows (`Payments[]`) |
| 14 | `incentive_plans` | B1 table / B6 engine | Plan header |
| 15 | `incentive_rules` | B1 table / B6 engine | Rule lines |
| 16 | `incentive_requests` | B3 | HOD header |
| 17 | `incentive_request_items` | B3 | Per-employee lines |
| 18 | `incentive_adjustments` | B4 | Post-approval corrections |
| 19 | `approval_history` | B4 | Approve / return / reject trail |
| 20 | `payment_batches` | B5 | Monthly payroll batch |
| 21 | `payment_batch_items` | B5 | Batch lines |
| 22 | `attachments` | B3 | Manual / special files |
| 23 | `notifications` | B6 | In-app + email records |
| 24 | `audit_logs` | B1 | Immutable action history |

Also needed though not in the 24-name list: `user_roles`, `user_departments`, `sale_projects` (for multiple projects), `month_locks`, `request_sequences` (for INC- ids). Add those in the same phase as the feature they serve. Do not add card tables.

---

## Phase B1 — Auth, masters, dashboard APIs, report shells

**This is the first backend coding step. It unblocks frontend F1.**

Exit outcome: the six seed users can log in; each response includes role and department scope; dashboard summary endpoints return role-specific payloads; report endpoints exist (seed/dummy rows allowed); Employee Master exists as dummy data.

### B1.1 Auth APIs

| Method | Path | Who | Does |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Email + password → JWT + user |
| POST | `/api/auth/logout` | Auth | Invalidate server session if used; client drops token either way |
| GET | `/api/auth/me` | Auth | Current user, role, departmentIds, display name |

Login success body the frontend F1 form expects:

```json
{
  "token": "…",
  "user": {
    "id": "…",
    "name": "Mark Watson",
    "email": "hod.ce@fims.local",
    "role": "HOD",
    "departmentIds": ["…ce-id…"],
    "homePath": "/hod/dashboard"
  }
}
```

Failed login: 401, no hint that enumerates users.  
Lockout / rate limit: add a simple per-email throttle in B1. Do not skip it.

### B1.2 Dashboard summary APIs (one per role, or one dispatcher)

Preferred: one dispatcher so the frontend always calls the same path.

`GET /api/dashboards/me?month=2026-09`

Server reads `req.user.role` and returns only that role’s shape (NFR-05). Do not send Finance company-wide totals to HOD.

#### Super Admin payload

- `kpis`: totalUsers, totalDepartments, totalEmployees, activeEmployees, inactiveEmployees, auditEventsToday
- `shortcuts`: users, departments, designations, roles, plans, settings, audit
- `recentAudit`: last N audit rows

#### HR payload

- `kpis`: total, active, noticePeriod, resigned, terminated, inactive, eligible, notEligible
- `shortcuts`: employeeList, addEmployee
- **no** incentive amount totals

#### HOD payload (FR-HOD-01 — every count)

- `kpis`: teamMembers, eligibleCollections, draft, submitted, returned, approved, paid
- `departmentIds`: authorized only
- In B1, counts may be zero or seed numbers. The **keys must all exist**. Do not omit `eligibleCollections` or `returned`.

#### Finance User payload (FR-FIN-06 — every count)

- `kpis`: pendingReview, returned, approved, readyForPayment, paid
- extra: unverifiedCollections, salesThisMonth
- `management`: totalCollectionsThisMonth, totalIncentives, incentiveCollectionPct, pendingRequests, approved, paid, departmentWiseIncentives[], topIncentiveCategories[], monthlyTrend[]
- In B1, management arrays may be empty. Keys must exist.

#### Finance Manager payload

- `kpis`: waitingFinalApproval, adjustmentsPending, batchesInProgress, batchesFinalizedThisMonth, readyForPayment, paid, monthLockStatus
- same `management` object as Finance User

#### Executive payload

- `management` object from SRS 9.2
- `waitingExtraApproval` count (0 until B6 thresholds)

### B1.3 Report APIs (exist in B1, live in B5)

Every dashboard Reporting section calls these. HOD results are department-scoped even in B1.

| Method | Path | Report |
|---|---|---|
| GET | `/api/reports/incentive-register` | Incentive Register |
| GET | `/api/reports/employee-incentive-history` | Employee Incentive History |
| GET | `/api/reports/department-summary` | Department Summary |
| GET | `/api/reports/hod-submissions` | HOD Submission Report |
| GET | `/api/reports/payments` | Payment Report |
| GET | `/api/reports/incentive-register.xlsx` | Excel (same columns) |
| GET | `/api/reports/department-summary.xlsx` | Excel |
| GET | `/api/reports/hod-submissions.xlsx` | Excel |
| GET | `/api/reports/payments.xlsx` | Excel |
| GET | `/api/reports/employee-incentive-history.xlsx` | Excel |

Common query params: `month`, `year`, `departmentId`, `employeeId`, `hodId`, `status`, `incentiveType`.

Register columns the API must be able to return: month, department, employee, hod, status, incentiveType, amount.

Department summary columns: department, totalSales, netCollections, totalIncentive, incentivePct.

HOD submission columns: hod, requests, approved, returned, rejected, pending.

Payment report columns: approved, readyForPayment, paid, unpaid.

Authorization:

- HOD: only own department. Ignore or 403 any other `departmentId`.
- HR: employee/eligibility extracts only. Money reports return 403.
- Finance User, Finance Manager, Super Admin, Executive: all five money reports.

B1 may return seed rows for the RFAB story (Brock Thompson $150, Addison Bruno $100, Mark Watson HOD, INC-CE-2026-0045, CE, September 2026) so F1 Reporting is not an empty box. Mark the payload `dataSource: "seed"` until B5 computes from real tables.

### B1.4 Department + designation + employee APIs

| Method | Path | Who | Fields / rules |
|---|---|---|---|
| GET/POST | `/api/departments` | Admin write; others read as allowed | Department ID, Name, Division, HOD, Finance Reviewer, Active/Inactive (FR-DEPT-01) |
| GET/PATCH | `/api/departments/:id` | Admin | Same fields |
| GET/POST | `/api/designations` | Admin / HR as configured | Name, status |
| GET | `/api/employees` | HR, Admin; HOD scoped later | Filter status, department, eligibility |
| POST | `/api/employees` | HR, Admin | All FR-EMP-01 fields |
| GET/PATCH | `/api/employees/:id` | HR, Admin | Status change, not hard delete if history (FR-EMP-03) |

FR-EMP-01 fields, none skipped: employeeCode (Employee ID), name, designationId, departmentId, division, managerEmployeeId, hodEmployeeId, joiningDate, employmentStatus, location, shift, incentiveEligible.

Statuses: `ACTIVE`, `NOTICE_PERIOD`, `RESIGNED`, `TERMINATED`, `INACTIVE`.

Employee repository interface:

```text
EmployeeSource.list(filters)
EmployeeSource.getById(id)
EmployeeSource.create(data)
EmployeeSource.update(id, data)
```

B1 implementation: PostgreSQL dummy rows. Later implementation: same interface, sync/read from the real employee API. Incentive and sale tables store `employee_id` only.

### B1.5 Seed data required in B1 (do not skip)

Departments: Construction Estimation, Medical Billing, Truck Dispatch, Digital Marketing, Software Development, IT, Hardware (FR-DEPT-02).

Designations at least: Seller, Closer, Account Manager, HOD, Software Engineer, IT Support, Finance User, Finance Manager.

Employees at least:

- Brock Thompson — CE — Seller — eligible
- Addison Bruno — CE — Closer / Account Manager — eligible
- Mark Watson — CE — HOD — eligible (linked to `hod.ce@fims.local`)
- One Software Development employee — eligible — **no sale**
- One IT employee — eligible — **no sale**

Users: the six login accounts in the table at the top.

Roles + permissions: menu allow list matching the frontend sidebar table.

`incentive_plans` / `incentive_rules` tables created empty or with inactive placeholders so CE is not hardcoded later (FR-RULE-04). Do not invent real percentages (open item).

### B1.6 Audit in B1

`audit_logs` table live. Login success/failure, employee create/update, department create/update are written now. Later phases append their own events to the same table.

### B1.7 B1 verification (do not call B1 done until these pass)

1. `POST /api/auth/login` with each of the six seed emails returns the matching `role` and `homePath`.
2. Wrong password returns 401.
3. HOD `departmentIds` contains only CE.
4. `GET /api/dashboards/me` as HOD returns all seven FR-HOD-01 keys.
5. Same endpoint as Finance User returns all five FR-FIN-06 keys plus `management`.
6. HOD calling a money report with another department id does not receive that department’s rows.
7. HR calling `/api/reports/incentive-register` is 403.
8. `GET /api/employees` returns dummy people including Brock, Addison, Mark, plus Software and IT.
9. PATCH employee to INACTIVE succeeds; DELETE of that employee is rejected if you already attached seed history, or is not exposed.
10. Schema has no card/cvv/expiry/zip columns.
11. Passwords in DB are hashed.

---

## Phase B2 — Clients, projects, sales, collection payments, verify, import

Unblocks frontend F3. Exit: Finance can create a sale with many payments and verify one of them (AC-02).

### B2.1 APIs

| Method | Path | Who | Notes |
|---|---|---|---|
| CRUD | `/api/clients` | Finance, Admin | name + company fields used on sale |
| CRUD | `/api/projects` | Finance, Admin | can attach many to one sale |
| CRUD | `/api/services` | Finance, Admin | catalog |
| GET/POST | `/api/sales` | Finance, Admin | FR-SALE-02 fields |
| GET/PATCH | `/api/sales/:id` | Finance, Admin | HOD read later via eligible endpoint, not this write API |
| PUT | `/api/sales/:id/employees` | Finance, Admin | roles: SELLER, ACCOUNT_MANAGER, CLOSER, ADDITIONAL_CONTRIBUTOR |
| GET/POST | `/api/sales/:id/payments` | Finance, Admin | child collection, unlimited |
| POST | `/api/payments/:id/verify` | Finance | status → VERIFIED |
| POST | `/api/payments/:id/status` | Finance | Received, Cancelled, Refunded, Partially Refunded |
| POST | `/api/imports/sales` | Finance, Admin | Excel upload + mapped columns |

### B2.2 Sale write fields (none skipped)

saleCode, saleDate, clientId, companyName, projectIds[], serviceId, saleType (`NEW_CLIENT` \| `EXISTING_CLIENT`), location, currency, contractAmount, invoiceAmount, taxOtherCharges, otherDeductions. Collected and netCollected are derived from verified/received payments + the FR-COL-02 formula.

### B2.3 Payment write fields (none skipped)

amount, paymentDate, method (`PAYPAL` \| `ZELLE` \| `ACH` \| `WIRE` \| `CHEQUE` \| `OTHER`), status (`PENDING` \| `RECEIVED` \| `VERIFIED` \| `CANCELLED` \| `REFUNDED` \| `PARTIALLY_REFUNDED`), fee, netAmount, transactionReference.

No first_payment / second_payment columns.

### B2.4 B2 verification

- One sale, three payment rows, one verified, two not.
- Net collected uses the formula.
- Import endpoint accepts a file and returns row errors without crashing.
- HOD cannot POST `/api/sales`.

---

## Phase B3 — Incentive requests (sale-based + manual/special)

Unblocks frontend F4. Exit: HOD can draft and submit a complete request (AC-03, AC-04, AC-05). ID format `INC-{DEPT}-{YEAR}-{SEQ}` (FR-HOD-07).

### B3.1 APIs

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/hod/eligible-collections` | HOD | Verified + incentive-eligible + scoped department only |
| GET/POST | `/api/incentive-requests` | HOD create; Finance read | header |
| GET/PATCH | `/api/incentive-requests/:id` | HOD if Draft/Returned | not if Approved (FR-AUTH-03) |
| POST | `/api/incentive-requests/:id/items` | HOD | employee from master only |
| DELETE | `/api/incentive-requests/:id/items/:itemId` | HOD if Draft/Returned | |
| POST | `/api/incentive-requests/:id/submit` | HOD | Draft/Returned → Submitted / Resubmitted |
| POST | `/api/incentive-requests/manual` | HOD | FR-MAN-01 path |
| POST | `/api/incentive-requests/:id/attachments` | HOD | required on manual (FR-MAN-02) |

### B3.2 Sale-based submit validation

Reject submit unless:

- period + department are the HOD’s (VC-07)
- payment status is VERIFIED (VC-03, BR-03)
- net collected > 0 (VC-04)
- every employee exists and is selectable (VC-01, BR-01, BR-10)
- no duplicate Sale + Payment + Employee + Type (VC-06, FR-DUP-01)
- source money is taken from sale/payment IDs, not from HOD-typed clones (FR-HOD-04, FR-COL-03)

On submit, generate `INC-CE-2026-0001` style id from `request_sequences`.

### B3.3 Manual / Special submit validation

No sale required. Require employee, amount, reason, comments, attachment (FR-MAN-02). This is the Software / IT path. Duplicate key for manual is not sale-based; block the same employee + type + period + department while a non-rejected request exists, so the same special bonus cannot be submitted twice in one month without an override.

### B3.4 Status values stored on the request (all of them)

`DRAFT`, `SUBMITTED`, `UNDER_FINANCE_REVIEW`, `RETURNED`, `RESUBMITTED`, `APPROVED`, `READY_FOR_PAYMENT`, `PAID`, `REJECTED`, `CANCELLED`.

Happy path: Draft → Submitted → Finance Review → Approved → Ready for Payment → Paid.  
Exception: Submitted → Returned → Resubmitted → Finance Review. Finance Review → Rejected.

### B3.5 B3 verification

- Eligible-collections omits unverified payments and other departments.
- Submit creates INC- id.
- Manual without attachment is 400.
- Software employee can be on a manual request with `sale_id` null.
- HOD cannot PATCH an approved request.

---

## Phase B4 — Finance review, validation engine, approvals, adjustments

Unblocks frontend F5. Exit: Finance can approve / return / reject with reasons; validation catches unverified, ineligible, duplicate (AC-06, AC-07, AC-09).

### B4.1 APIs

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/api/finance/inbox` | Finance User, Manager | counts + lists: pending, returned, approved, readyForPayment, paid (FR-FIN-06) |
| GET | `/api/finance/requests/:id` | Finance, Manager | FR-FIN-02 payload + server checklist |
| POST | `/api/finance/requests/:id/start-review` | Finance | → UNDER_FINANCE_REVIEW |
| POST | `/api/finance/requests/:id/approve` | Finance as authorized; Manager final | |
| POST | `/api/finance/requests/:id/return` | Finance | body.reason required |
| POST | `/api/finance/requests/:id/reject` | Finance | body.reason required |
| POST | `/api/finance/requests/:id/duplicate-override` | Super Admin only | reason required (FR-DUP-03) |
| POST | `/api/adjustments` | Finance Manager | linked to original, reason required |
| GET | `/api/adjustments` | Finance Manager, Admin | history with original (FR-ADJ-03) |

Until the client gives an authority matrix, **Finance Manager is the final approver**. Finance User may recommend or approve only if a setting says so. Do not invent thresholds (open item).

### B4.2 Server checklist on GET review (FR-FIN-03, VC-01–VC-08)

Return a structured list, not a boolean:

- employeeExists
- employeeActiveEligible
- saleExists (N/A if manual)
- paymentVerified (N/A if manual)
- netCollectionGtZero (N/A if manual)
- planOrManualPermitted
- notDuplicate
- correctDepartment
- correctPeriod

Approve must refuse if any required check is false.

Return/Reject without `reason` is 400 (FR-FIN-05, BR-07).

Write `approval_history` on every decision.

### B4.3 B4 verification

- Sale-based request on a Received (not Verified) payment cannot approve.
- Inactive employee cannot approve.
- Second submit of same Sale+Payment+Employee+Type is blocked with a clear error.
- Return with empty reason is 400.
- Adjustment does not change the original item amount column.

---

## Phase B5 — Payroll batches, paid status, live reports, Excel, month lock

Unblocks frontend F6. Exit: approved money can be batched and marked Paid; reports read real tables (AC-08, AC-11).

### B5.1 APIs

| Method | Path | Who | Notes |
|---|---|---|---|
| GET/POST | `/api/payment-batches` | Finance create; Manager finalize | month + year |
| GET | `/api/payment-batches/:id` | Finance, Manager | department totals + overall (FR-BAT-02) |
| POST | `/api/payment-batches/:id/finalize` | Finance Manager only | lock batch (FR-BAT-03, FR-BAT-04) |
| POST | `/api/payment-batches/:id/mark-paid` | Finance / Manager as configured | items → PAID (FR-BAT-05) |
| GET | `/api/payment-batches/:id/employee-totals` | Finance, Manager | across types + adjustments (FR-BAT-06) |
| GET/POST | `/api/month-locks` | Finance Manager | FR-LOCK-01 |
| POST | `/api/month-locks/:yearMonth/reopen` | Authorized only | reason required (FR-LOCK-02) |

Finalize copies / links approved requests into `payment_batch_items` and sets request status `READY_FOR_PAYMENT`, then `PAID`.

Locked month: any normal PATCH on sales, payments, requests for that period returns 409 (VC-09).

### B5.2 Reports become live

Same URLs as B1.3. `dataSource` becomes `"live"`. Excel uses the same queries. No card fields in the spreadsheet.

### B5.3 B5 verification

- Appendix B path can be completed on real rows: verified collection → HOD submit $150 / $100 → Finance approve → September batch → Paid → appears on employee history and audit.
- Finalized batch rejects item edits.
- Locked month rejects a sale edit.
- All five reports return live columns listed in B1.3.

---

## Phase B6 — Rules engine, multi-level approval, notifications, advanced audit

SRS Phase 6. Do not start before B3–B5.

### B6.1 Rules APIs (FR-RULE-01 to FR-RULE-06)

CRUD `/api/incentive-plans` and `/api/incentive-rules`.

Rule fields, none skipped: planName, departmentId, saleType, employeeRole, calculationBasis, percentage, fixedAmount, minimumCollection, maximumIncentive, effectiveFrom, effectiveTo, status.

Must store Digital Marketing factors (First Collection, Qualified Leads, Conversions, Project Performance, SEO Members, Manager, Division Head) as configuration rows, not CE-only columns.

Must store Medical Billing models (collection, new client, implementation, performance) the same way.

`POST /api/incentive-requests/:id/preview-calculation` applies matching rules. Phase B3 remains manual if no rule matches (FR-RULE-03).

Do not seed invented percentages.

### B6.2 Multi-level approval config (FR-AUTH-04, FR-MAN-03)

Settings: departmentId, amountThreshold, extraRole (`EXECUTIVE` / `FINANCE_MANAGER`). Empty config means current B4 path only.

### B6.3 Notifications (SRS section 10)

| Event | Recipient |
|---|---|
| HOD submits | Finance |
| Finance returns | HOD |
| Finance/Manager approves | relevant users |
| Batch / payment processed | relevant users |

`notifications` rows for in-app. Email sender is configurable and not chosen in this file (open item). Email body = short text + link, not a full money dump.

### B6.4 Audit API

`GET /api/audit-logs` with filters: user, entity, date, action. Super Admin full access. Others by permission (SR-07). AC-10: material actions visible.

### B6.5 B6 verification

- A CE sales rule and a Digital Marketing lead rule can both exist without schema change.
- Preview-calculation returns an amount only when a live rule matches.
- Submit creates a Finance in-app notification.
- Audit GET shows approve/return/adjust/batch finalize with old/new/reason.

---

## Status and enum cheat sheet (use these strings everywhere)

**Employee:** ACTIVE, NOTICE_PERIOD, RESIGNED, TERMINATED, INACTIVE  

**Sale type:** NEW_CLIENT, EXISTING_CLIENT  

**Sale employee role:** SELLER, ACCOUNT_MANAGER, CLOSER, ADDITIONAL_CONTRIBUTOR  

**Collection payment method:** PAYPAL, ZELLE, ACH, WIRE, CHEQUE, OTHER  

**Collection payment status:** PENDING, RECEIVED, VERIFIED, CANCELLED, REFUNDED, PARTIALLY_REFUNDED  

**Incentive type:** SALES, CLOSING, ACCOUNT_MANAGEMENT, PERFORMANCE, SEO, SUPPORT, SPECIAL, BONUS, ADJUSTMENT, OTHER  

**Request status:** DRAFT, SUBMITTED, UNDER_FINANCE_REVIEW, RETURNED, RESUBMITTED, APPROVED, READY_FOR_PAYMENT, PAID, REJECTED, CANCELLED  

**Payroll item status:** READY_FOR_PAYMENT, PAID  

**Month lock:** LOCKED, UNLOCKED  

---

## Security checklist for every backend phase

| ID | How the API obeys it |
|---|---|
| SR-01 | JWT/session + RBAC on every non-login route |
| SR-02 | `scopeHod` middleware |
| SR-03 / AC-12 | no card columns, reject payloads that contain card-like keys |
| SR-04 | payment method/status/date/reference only |
| SR-05 | audit_logs writer used by all money modules |
| SR-06 | adjustments table, no in-place approved edits |
| SR-07 | audit and approve routes permission-checked |
| BR-12 | same as SR-03 |

---

## Acceptance criteria → backend phase

| ID | Backend phase that makes it true |
|---|---|
| AC-01 | B1 employee write + no hard delete |
| AC-02 | B2 multiple payments + verify |
| AC-03 | B3 eligible-collections scope |
| AC-04 | B3 read-only source IDs, no HOD update on sale |
| AC-05 | B3 draft + submit + items |
| AC-06 | B4 validation engine |
| AC-07 | B4 approve/return/reject + reason |
| AC-08 | B5 batch + paid |
| AC-09 | B4/B5 adjustments, no overwrite |
| AC-10 | B1 writer + B6 list API |
| AC-11 | B1 routes + B5 live queries + Excel |
| AC-12 | B1 schema review, repeated every phase |

---

## Open items the backend must keep configurable (do not hardcode)

1. Incentive percentages / fixed amounts by department and role  
2. Approval amount thresholds and which departments need Executive  
3. Finance User vs Finance Manager authority matrix  
4. Whether every manual/special always needs higher approval  
5. Numeric NFRs (SLA, backup, RPO/RTO)  
6. Final Excel import column map  
7. Email vendor and templates  
8. Whether IP/session is mandatory on audit rows  

Safe B1–B5 default: Finance Manager final-approves; extra approvers off; rates manual; email off until B6 config exists.

---

## Frontend F1 ↔ backend B1 call list (first coding slice)

When you start, implement only these backend pieces:

1. Postgres + migrations for `users`, `roles`, `permissions`, `user_roles`, `user_departments`, `departments`, `designations`, `employees`, `employee_reporting`, `audit_logs`, empty `incentive_plans` / `incentive_rules`.  
   Verify: migrate succeeds; no card columns.
2. Seed six users (hashed passwords), seven departments, dummy employees.  
   Verify: SQL select shows Brock, Addison, Mark, Software, IT.
3. `POST /api/auth/login` + `GET /api/auth/me`.  
   Verify: six emails, six roles, HOD scoped to CE.
4. `GET /api/dashboards/me`.  
   Verify: role-specific KPI keys from B1.2 all present.
5. Report GET endpoints + Excel stubs + HR 403 on money reports.  
   Verify: HOD cannot read another department; F1 Reporting can bind the JSON.
6. Employee and department CRUD for HR/Admin.  
   Verify: create employee with every FR-EMP-01 field.

Stop after B1 until you say to continue. Do not build sale tables in the same breath as login unless you explicitly ask for B2 next.
