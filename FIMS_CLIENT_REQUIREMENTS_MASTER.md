# Finance Incentive Management System (FIMS)

## Master Client Requirements File

**Organization:** IPS-USA  
**Document type:** Software Requirements Specification (SRS) v1.0 — September 2026  
**Status in Word file:** Baseline for Development / Review  
**System classification:** Internal Finance Application  
**Sources evaluated:**

1. `Finance_Incentive_Management_System_SRS.docx` — full 25-page Word SRS (every section, table, requirement ID, appendix).
2. UI snapshot attached in chat — conceptual mock of portal layout, workflow, forms, roles, report and security banner.

**This file is the single narration of what the client actually wants.**  
It is not a rewrite of the SRS. It is a line-by-line reading of both sources, written so development can start from one place.

**Implementation preference (your decision, not stated in the Word file):** Node.js + Express + PostgreSQL + React (Vite, latest). Architecture must be scalable, secure, and fast.

**Employee data note (your instruction):** Employee API will come later. Phase 1 will use dummy/local employee records that match the Employee Master shape. When the API arrives, the employee source should be swappable without rewriting incentive, sales, or approval logic.

---

## 1. What the client actually wants — in one page

The client (IPS-USA Finance / Division Head) wants to **stop running incentives on email and Excel**.

Today the process is:

`HOD → Email / Excel → Finance → Manual verification → Incentive calculation → Payment`

They want this instead:

`Employee Master → Sales / Collection → HOD Incentive Request → Finance Verification → Approval → Payroll / Payment → Reports & Audit`

The system is an **internal finance application**, not a payment gateway and not a card processor.

### The real business problem

1. Incentives are processed company-wide, not for one department.
2. Sale-based incentives must be tied to **verified collections**, not just “a sale happened”.
3. The same sale + payment + employee + incentive type must never be paid twice.
4. After approval, nobody overwrites the original numbers. Corrections become **adjustment records**.
5. Every material action is traceable: who did what, when, old value, new value, reason.
6. Different departments (Construction Estimation, Medical Billing, Truck Dispatch, Digital Marketing, Software, IT, Hardware) will have **different incentive policies**. Those rules must be configuration, not hardcoded CE logic.
7. Card data is forbidden: no card number, CVV, expiry, billing ZIP — anywhere in UI, API, or database.

### What “done” looks like for the client

A HOD can pick a verified collection, assign incentives to employees from the master list, save draft or submit. Finance can validate, approve, return, or reject. Approved amounts go into a monthly payroll batch, get paid, lock, and appear on reports and employee history. The RFAB Weather Hardening example in Appendix B is the story they keep repeating — that path must work end to end.

### What they explicitly do **not** want in Phase 1

- Card processing / payment gateway.
- Every department rule fully automated on day one. Rates may start **manual / configurable**.
- Auto-calculation, multi-level approval, advanced dashboard, and full rules engine as the first build. Those are **Phase 6**.
- Starting development from dashboards and charts. They wrote: **do not start from dashboards**. Build the transactional and control foundation first.

---

## 2. Snapshot evaluation (line by line)

The snapshot is a **concept UI**, not a pixel-perfect specification. Several fields on it **conflict with the Word SRS**. Where they conflict, the **Word SRS is the authority** unless the Division Head later says otherwise.

### 2.1 Header bar

| Snapshot text | Meaning | Alignment with Word SRS |
|---|---|---|
| **Finance Incentive Management System** | Product name | Matches header: `IPS-USA \| Finance Incentive Management System` |
| **Streamlined \| Secure \| Transparent \| No Card Details** | Marketing / security positioning | Matches security principle and SR-03 |
| **Secure by Design** | Security badge | Matches SR-01 to SR-07 |
| **No credit card information is collected, stored, or processed in this application** | Hard security rule | Exact match with Word file opening principle and AC-12 |

### 2.2 Top process ribbon (7 steps)

Snapshot order:

1. **Employee Master** — all employees with department, designation, HOD, etc.
2. **Sales / Collection** — project and collection details, no card data.
3. **HOD Submission** — HOD submits incentive request for the team.
4. **Finance Review** — verify collections and incentive eligibility.
5. **Approval Workflow** — HOD → Finance → Finance Manager (as per role).
6. **Payroll / Payment** — final processing and payout.
7. **Reports & Audit** — complete history and analytics.

Word file target process is the same chain, worded as:

`Employee Master → Sales/Collection → HOD Incentive Request → Finance Verification → Approval → Payment → Reporting`

**Verdict:** Snapshot ribbon matches SRS core flow. Keep this as the product spine.

### 2.3 User roles row in the snapshot

| Snapshot role | Snapshot wording | Word SRS role | Notes |
|---|---|---|---|
| **Admin** | System setup and permissions | **Super Admin** | Same job. Use Super Admin as the official name. |
| **HR** | Employee master data | HR | Matches. HR must **not** calculate financial incentive amounts. |
| **HOD** | Submit incentive for team | HOD | Matches. Scoped to authorized department/team only. |
| **Finance User** | Verify and process requests | Finance User | Matches. |
| **Finance Manager** | Final approval | Finance Manager | Matches. Final approval, adjustments, finalize payroll batch. |
| **CEO / CFO (optional)** | High-value approvals and oversight | **Division Head / CFO / CEO** | Snapshot dropped **Division Head**. SRS includes it as optional/configurable extra approval. |

**Verdict:** Six roles, last one optional. Snapshot is slightly incomplete on Division Head. Build roles as the SRS table, not the shorter snapshot labels.

### 2.4 Left sidebar — “Finance Portal”

Snapshot menu:

- Dashboard
- Employees
- Departments
- Sales / Collections
- Incentive Requests
- Approvals
- Payroll
- Reports
- Settings

Word Appendix A recommended first screens:

- General: Login, Dashboard
- Employees: List, Add/Edit, Profile
- Departments: Department management
- Sales / Collections: Sales List, Create Sale, Sale Detail, Add Payment, Verify Payment
- Incentives: My Requests, New Request, Request Detail, Returned Requests
- Finance: Review Queue, Review Detail, Approved Requests, Payment Batches
- Reports: Reports / Export
- Administration: Settings

**Verdict:** Snapshot sidebar is a valid IA sketch. Appendix A is the screen list to implement. Sidebar labels can follow the snapshot; screens behind them must follow Appendix A.

### 2.5 Column 1 — Sales / Collection Entry (snapshot form)

This is the most important snapshot/SRS conflict.

#### Fields shown

**Identity / commercial**

- Client Name * — example: Vincent Logozzo
- Company Name * — example: De Colores Industrial LLC
- Project Name * — example: RFAB Weather Hardening
- Service * — example: Shop Drawings
- Sale Type * — example: New
- Location — example: Texas
- Project Date — example: 09/15/2026

**Financial Information**

- Total Contract Amount — example: 18750
- First Payment — example: 2775
- First Payment Status — example: Paid
- Second Payment — example: (empty)
- Paid Second Status — example: Not Collected
- Uncollected Amount — example: 16750

**Team Information**

- Seller — Brock Thompson
- Closer — Addison Bruno
- Account Manager — Addison Bruno

**Payment Information**

- Payment Method — Zelle
- Payment Status — Paid
- Transaction ID (optional)
- Initial payment received — 09/15/2026
- Save button

#### What this column tells us the client wants

Finance (not HOD) captures the commercial truth of a sale: who the client is, what was sold, who sold/closed it, how much was contracted, what was collected, how it was paid, and what is still uncollected.

#### Conflicts with the Word SRS (do not copy the snapshot blindly)

1. **First Payment / Second Payment as fixed fields is forbidden by the SRS.**  
   `FR-PAY-01`: Payments shall be modeled as **independent records** under a sale and shall **not** be limited to First Payment and Second Payment fields.  
   `7.3`: Payments must be stored as a child collection `Payments[]`.

2. **Payment status “Paid” on the snapshot is the wrong vocabulary for collections.**  
   SRS payment statuses: **Pending, Received, Verified, Cancelled, Refunded, Partially Refunded**.  
   “Paid” belongs to **incentive payroll** status, not collection payment status.  
   Sale-based incentives are allowed only when collection status is **Verified** (`FR-PAY-05`, `BR-03`).

3. **Uncollected Amount** is useful UX, not a stored source of truth.  
   Derive it: contract/invoice minus collected (or remaining after verified payments). Do not let users type it as a second source of money.

4. **Team roles on snapshot are Seller, Closer, Account Manager.**  
   SRS `FR-SALE-04` also requires optional **Additional Contributor**.

5. **Payment methods on snapshot show only Zelle.**  
   SRS `FR-PAY-03`: PayPal, Zelle, ACH, Wire, Cheque, Other.

6. **Contract amount in snapshot ($18,750) does not match Appendix B ($4,650).**  
   Same project name, different numbers. Treat both as **sample data**, not as a business rule. The process matters, not the dollar figure.

7. **Snapshot does not show taxes, other charges, other deductions, or net collected formula.**  
   SRS `FR-COL-01` and `FR-COL-02` require:  
   `Net Collected = Collected − Tax/Other Charges − Other Deductions`

**How to build this screen:** follow SRS payment model (add many payments, verify each one). Use the snapshot only for visual density and field grouping.

### 2.6 Column 2 — HOD Incentive Submission (snapshot form)

#### Fields shown

- Month * — September 2026
- Department * — CE
- **Select Verified Sale** — RFAB Weather Hardening – Vincent Logozzo ($2,775)
- Read-only source block:
  - Client: Vincent Logozzo
  - Project: RFAB Weather Hardening
  - Collection: $2,775.00
  - Net Collection: $2,775.00
  - Collection Status: Verified by Finance
- **Select Employees for Incentive** + Add Employee
- Line table: Employee, Designation, Incentive Type, Amount, Comments
  - Brock Thompson / Seller / Sales / 150.00 / new sale
  - Addison Bruno / Closer / Sales / 100.00 / Project close
- Total Incentive: $250.00
- Additional Comments: “Incentive for September based on verified collection.”
- Buttons: **Save Draft**, **Submit to Finance**

#### What the client wants here

HOD does **not** invent the sale or the collection. HOD only:

1. Picks period + authorized department.
2. Picks a **verified, incentive-eligible** collection.
3. Sees source money as **read-only**.
4. Gets suggested employees from the sale team.
5. Can add/remove eligible employees, type/select incentive type, enter amount, comment.
6. Saves draft or submits.

This matches `FR-HOD-01` to `FR-HOD-07` closely. It is the strongest part of the snapshot.

#### Gaps vs SRS on this column

- Snapshot does not show request ID generation. SRS wants `INC-{Department}-{Year}-{Sequence}` (example: `INC-CE-2026-0045`).
- Snapshot does not show returned-request correction path.
- Snapshot does not show Manual / Special Incentive (no sale link). SRS `FR-MAN-01` to `FR-MAN-03` requires it.
- Snapshot net collection is $2,775; Appendix B net is $2,680.64. Again, sample data only.
- Snapshot does not show attachment upload (required for manual/special incentives).

### 2.7 Column 3 — Finance Review (snapshot)

#### Fields shown

- Request ID: **INC-CE-2026-0045**
- Submitted by: Mark Watson (HOD)
- Submission Date: 10/01/2026
- Department: CE
- Month: September 2026
- Total Incentive: $250.00

**Verification Checklist**

- Sale Verified
- Payment Received
- Employee Active
- Incentive Policy Matched
- No Duplicate Request

**Approval Status:** Approved  
**Finance Comment:** Verified. Approved for payroll.

Buttons: **Approve**, **Return**, **Reject**

#### What the client wants here

Finance gets a queue item, sees the full request, runs system validations, writes a comment, and chooses Approve / Return / Reject.

#### Gaps vs SRS checklist

SRS `FR-FIN-03` validation is stricter than the snapshot ticks:

| Snapshot tick | SRS required check |
|---|---|
| Sale Verified | Sale exists + collection/payment is **Verified** (not merely “received”) |
| Payment Received | Too weak. Received is not enough. Must be **Verified**. Net collection **> 0**. |
| Employee Active | Employee exists, active/eligible as required |
| Incentive Policy Matched | Applicable plan exists, or permitted manual process |
| No Duplicate Request | Same Sale + Payment + Employee + Incentive Type must not already exist |
| *(missing)* | Correct department |
| *(missing)* | Correct period |
| *(missing)* | Return / Reject **require a reason** (`FR-FIN-05`, `BR-07`) |

Finance Inbox counts required by SRS (`FR-FIN-06`): pending review, returned, approved, ready for payment, paid.

### 2.8 Column 4 — Key Features, Security, Sample Report

**Key Features listed on snapshot**

- Employee master with department and HOD
- Sale / collection linked with incentives
- HOD employee linked with secure form
- Finance verification and approval
- Configurable incentive rules
- No duplicate incentive
- No card details (completely removed)
- Audit trail and reports
- Email alerts (optional)

All of these are in the Word file. Email is not optional in the SRS wording: “Initial delivery shall support **in-app and email** notifications.” Snapshot says optional; SRS says both. Treat **in-app as must**, email as must for Phase 6 / notifications section, and keep email body light (link to the secured record, not full money details).

**Important Security Note on snapshot**

> This application does NOT collect, store, or display any credit card information (card number, CVV, expiration date, or billing ZIP code).  
> Only payment method, status, date, and transaction reference (if available) are maintained.

This is identical to `SR-03` and `SR-04`. It is a **hard acceptance criterion** (`AC-12`).

**Sample Report — Monthly Incentive Register**

Columns shown: Employee, Department, Total Incentive, Status  
Examples:

- Addison Bruno / CE / $30.00 / Approved
- Brock Thompson / CE / $250.00 / Approved
- Mark Watson / CE / $150.00 / Approved

Action: **Export to Excel**

SRS Phase-1 reports are broader than this sample:

1. Incentive Register — Month, Department, Employee, HOD, Status, Incentive Type
2. Employee Incentive History
3. Department Summary — Department, Total Sales, Net Collections, Total Incentive, Incentive %
4. HOD Submission Report — Requests, Approved, Returned, Rejected, Pending
5. Payment Report — Approved, Ready for Payment, Paid, Unpaid

Snapshot sample is only a teaser of report 1. Build all five.

### 2.9 Footer of snapshot

- “Built for Efficiency, Designed for Compliance, Focused on People.”
- “Finance Incentive Management System”

Tone only. No extra functional requirement.

---

## 3. Word SRS — complete narration (nothing skipped)

Header on every page: `IPS-USA | Finance Incentive Management System`  
Footer on every page: `Software Requirements Specification | Version 1.0 | September 2026`

### 3.1 Cover / document control

| Item | Value |
|---|---|
| Organization | IPS-USA |
| Document Type | Software Requirements Specification (SRS) |
| Version | 1.0 |
| Date | September 2026 |
| Status | Baseline for Development / Review |
| System Classification | Internal Finance Application |

**Purpose of the Word file:** define functional, business, data, security, workflow and reporting requirements.

**Primary users:** Admin / Super Admin, HR, HOD, Finance User, Finance Manager; optional Division Head / CFO / CEO.

**Change control:** any material change to incentive logic, approval authority, payment workflow, or financial data model must be version-controlled and approved before implementation.

**Opening security principle (before TOC):**

> The application shall not collect, store, process, or display credit/debit card number, CVV, expiry date, or billing ZIP code.

### 3.2 Table of contents in the Word file

1. Introduction  
2. Scope and System Context  
3. User Roles and Access  
4. Functional Requirements  
5. Business Rules  
6. Workflow and Status Model  
7. Data Requirements  
8. Validation and Controls  
9. Reports and Dashboards  
10. Notifications  
11. Security and Audit Requirements  
12. Non-Functional Requirements  
13. MVP and Development Phases  
14. Acceptance Criteria  
15. Assumptions and Open Configuration Items  
Appendix A — (TOC says Core Entities; body actually gives Recommended First Screen Set)  
Appendix B — End-to-End Example  
Appendix C — Requirement Traceability Summary (present in body, not listed in TOC)

Core entities actually live in **section 7.2**, not Appendix A.

---

## 4. Introduction — why they want this system

### 4.1 Purpose (1.1)

Replace email/Excel incentive processing with one application that:

- maintains employee and department masters
- records sales and collections
- lets HODs submit incentive requests
- lets Finance verify and approve
- supports payroll / payment processing
- keeps complete reporting and audit history

### 4.2 Current vs target (1.2)

| Current | Target |
|---|---|
| HOD → Email/Excel → Finance → Manual Verification → Incentive Calculation → Payment | Employee Master → Sales/Collection → HOD Incentive Request → Finance Verification → Approval → Payment → Reporting |

### 4.3 Objectives (1.3) — seven goals, all in scope

1. Centralize company-wide incentive processing.
2. Make calculation and approval transparent and traceable.
3. Link sale-based incentives to **verified collections**.
4. Prevent duplicate incentives and unauthorized post-approval edits.
5. Support different incentive policies **by department** without hardcoding one department’s rules.
6. Keep employee-wise, department-wise, payment and audit history.
7. Leave a scalable base for **future** bonuses, reimbursements, commissions, purchase approvals, and recurring-expense workflows.

Goal 7 is **future extensibility**, not Phase 1 scope. Architecture should not block those later modules. Do not build them now.

### 4.4 Out of scope / exclusions (1.4)

- No card number, CVV, expiry, billing ZIP.
- Not a card-processing or payment-gateway application.
- Phase 1 does **not** require every department rule to be fully automated. Rates may be manual/configurable at first.

---

## 5. Scope and system context

### 5.1 Core system flow (2.1)

`Master Data → Transaction → Verification → Incentive → Approval → Payment → Audit`

### 5.2 Major modules (2.2)

| Module | What the client wants it to do |
|---|---|
| Employee & Department Master | Employees, reporting structure, eligibility, department ownership |
| Sales / Collections | Clients, projects, sales, payments, verified net collections |
| HOD Incentive Requests | Select eligible collections/employees and submit incentives |
| Finance Review | Validate collections, employees, policy, duplicates, amounts |
| Approval Workflow | Approve, return, reject; route higher-value/manual items when configured |
| Payroll / Payment | Monthly batches, finalize, paid status |
| Reports & Audit | Registers, summaries, history, management views, immutable action history |
| Rules Engine | Department / sale-type / role-specific incentive rules |

Rules Engine is a real module, but **full auto-calculation is Phase 6**. Phase 1 still needs the data model for plans/rules so CE is not hardcoded.

---

## 6. User roles and access — exact responsibilities

| Role | Required access / responsibility |
|---|---|
| **Super Admin** | Users, departments, designations, roles, permissions, incentive rules, approval workflows, settings, complete audit logs |
| **HR** | Employee Master only. **HR shall not calculate financial incentive amounts.** |
| **HOD** | View authorized team / eligible sales; create, save, submit, correct incentive requests; view previous incentives. **Cannot** edit Finance-verified data. **Cannot** see other departments. |
| **Finance User** | Create/import and verify collections; review HOD requests; verify amounts/eligibility; return/reject; recommend/approve according to authority; maintain payment status |
| **Finance Manager** | Review Finance-verified requests; final approval; approve adjustments; finalize payroll batch; view reports |
| **Division Head / CFO / CEO** | Optional / configurable extra approval for selected departments or amount thresholds |

### Authorization requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-01 | Enforce role-based access control | Must |
| FR-AUTH-02 | HOD users access only authorized departments and teams | Must |
| FR-AUTH-03 | Approved requests are not directly editable by HOD | Must |
| FR-AUTH-04 | Extra approval levels configurable by department and/or amount threshold | Should |

---

## 7. Functional requirements — every ID

### 7.1 Employee Master

| ID | Requirement | Priority |
|---|---|---|
| FR-EMP-01 | HR creates/maintains: Employee ID, name, designation, department, division, manager, HOD, joining date, employment status, location, shift, incentive eligibility | Must |
| FR-EMP-02 | Statuses: **Active, Notice Period, Resigned, Terminated, Inactive** | Must |
| FR-EMP-03 | Do not physically delete employees who have historical incentive records; change status instead | Must |
| FR-EMP-04 | Employee names in transactions are **selected from Employee Master**, never free-typed | Must |
| FR-EMP-05 | Only active/eligible employees are selectable where policy requires it | Must |

**Your implementation note (not in SRS, from you):**  
Employee API comes later. Start with dummy employees that already have these fields. Keep a single employee-source interface so later you replace dummy data with the real API. Incentive requests must still pick employees from that master, never typed names.

### 7.2 Department Master

| ID | Requirement | Priority |
|---|---|---|
| FR-DEPT-01 | Department ID, Name, Division, HOD, Finance Reviewer, Active/Inactive | Must |
| FR-DEPT-02 | Data model must support at least: Construction Estimation, Medical Billing, Truck Dispatch, Digital Marketing, Software Development, IT, Hardware — **without department-specific schema changes** | Must |

CE is only one department. The app must not become “the CE incentive app”.

### 7.3 Client, Project and Sales

| ID | Requirement | Priority |
|---|---|---|
| FR-SALE-01 | Finance can create **or import** sales and collection records | Must |
| FR-SALE-02 | Sale fields: Sale ID, date, client, company, project, service, sale type, location, currency | Must |
| FR-SALE-03 | Sale Type at least: **New Client**, **Existing Client** | Must |
| FR-SALE-04 | Link employees as Seller, Account Manager, Closer, optional Additional Contributor | Must |
| FR-SALE-05 | One sale may relate to one project **or multiple projects** | Must |

Import / Excel migration is Phase 2. Final Excel format is still an open item (section 15).

### 7.4 Commercial and collection information

| ID | Requirement | Priority |
|---|---|---|
| FR-COL-01 | Maintain: total contract amount, invoice amount, collected amount, taxes/other charges, other deductions, net collected amount | Must |
| FR-COL-02 | **Net Collected = Collected − Tax/Other Charges − Other Deductions** | Must |
| FR-COL-03 | Do not manually re-type source financial values across modules. Reference the source transaction. | Must |

This is why HOD sees collection/net as read-only. Money is born in Finance sales/payments, then reused.

### 7.5 Payments (collections from clients)

These are **client payments against a sale**, not employee payroll payouts.

| ID | Requirement | Priority |
|---|---|---|
| FR-PAY-01 | Payments are independent child records. Not First/Second Payment columns | Must |
| FR-PAY-02 | Each payment: Payment ID, Sale ID, amount, payment date, payment method, status, fee, net amount, transaction/reference | Must |
| FR-PAY-03 | Methods: PayPal, Zelle, ACH, Wire, Cheque, Other | Must |
| FR-PAY-04 | Statuses: Pending, Received, Verified, Cancelled, Refunded, Partially Refunded | Must |
| FR-PAY-05 | Only **Verified** collections are eligible for sale-based incentive | Must |
| FR-PAY-06 | Never collect or store payment-card credentials/details | Must |

Allowed non-card payment metadata (`SR-04`): method, status, date, transaction/reference ID. Optional fee and net amount are allowed because they are not card data.

### 7.6 HOD dashboard and incentive request

| ID | Requirement | Priority |
|---|---|---|
| FR-HOD-01 | Dashboard counts: team members, eligible collections, draft, submitted, returned, approved, paid | Must |
| FR-HOD-02 | Create request by selecting period + authorized department | Must |
| FR-HOD-03 | Collection picker shows only verified + incentive-eligible records | Must |
| FR-HOD-04 | After selection, show as **read-only**: client, company, project, service, sale type, linked employees, contract amount, collection, deductions, net collection, payment date | Must |
| FR-HOD-05 | Suggest employees linked to the selected sale | Must |
| FR-HOD-06 | HOD can add/remove eligible employees, select incentive type, enter/calculated rate/amount, add comments, save draft, submit to Finance | Must |
| FR-HOD-07 | Unique ID: `INC-{Department}-{Year}-{Sequence}` or equivalent configurable format | Must |

### 7.7 Incentive types and rules

| ID | Requirement | Priority |
|---|---|---|
| FR-RULE-01 | Types: Sales, Closing, Account Management, Performance, SEO, Support, Special, Bonus, Adjustment, Other | Must |
| FR-RULE-02 | Rules engine fields: Plan Name, Department, Sale Type, Employee Role, Calculation Basis, Percentage/Fixed Amount, Minimum Collection, Maximum Incentive, Effective From/To, Status | Must |
| FR-RULE-03 | Phase 1: manual/configurable rates. Later: auto-calculate | Should |
| FR-RULE-04 | Do **not** hardcode Construction Estimation | Must |
| FR-RULE-05 | Digital Marketing rules must be able to represent: First Collection, Qualified Leads, Conversions, Project Performance, SEO Members, Manager, Division Head | Must |
| FR-RULE-06 | Medical Billing rules must be able to represent: collection, new client, implementation, performance-based | Must |

**Reading this correctly:** Phase 1 must store and select types, and allow manual amounts. The rules table should exist so Digital Marketing and Medical Billing models can be represented later. Auto-apply of percentages is Phase 6 (`Should` for Phase 1).

### 7.8 Finance review and validation

| ID | Requirement | Priority |
|---|---|---|
| FR-FIN-01 | Submitted requests land in a Finance review queue | Must |
| FR-FIN-02 | Review screen shows: request number, department, HOD, period, submission date, total incentive, sale/collection details, employee incentive items | Must |
| FR-FIN-03 | Validate: employee exists, active/eligible, sale exists, payment verified, net collection > 0, applicable plan, no duplicate, correct department, correct period | Must |
| FR-FIN-04 | Finance can Approve, Return to HOD, or Reject | Must |
| FR-FIN-05 | Return and Reject **require a reason** | Must |
| FR-FIN-06 | Inbox counts/lists: pending review, returned, approved, ready for payment, paid | Must |

### 7.9 Duplicate prevention

| ID | Requirement | Priority |
|---|---|---|
| FR-DUP-01 | Block same **Sale + Payment + Employee + Incentive Type** processed more than once | Must |
| FR-DUP-02 | On duplicate: clear warning + block normal processing | Must |
| FR-DUP-03 | If admin override exists, override reason is mandatory | Must |

This is one of the client’s strongest control rules. Design the unique constraint at database level, not only in UI.

### 7.10 Manual / Special incentive

| ID | Requirement | Priority |
|---|---|---|
| FR-MAN-01 | HOD can create Manual/Special Incentive **not linked to a verified sale**, if policy permits | Must |
| FR-MAN-02 | Requires: employee, amount, reason, supporting comments, **attachment** | Must |
| FR-MAN-03 | May auto-route to higher approval based on configuration | Should |

Snapshot never showed this path. It is still a Must in the Word file.

### 7.11 Adjustments

| ID | Requirement | Priority |
|---|---|---|
| FR-ADJ-01 | Approved or Paid records cannot be directly edited | Must |
| FR-ADJ-02 | Post-approval corrections are **separate adjustment transactions** linked to the original | Must |
| FR-ADJ-03 | Original + adjustment history stay available for audit | Must |

### 7.12 Payroll / payment batch (employee payout)

This is the **second** meaning of “payment” in the product. Do not mix it with client collection payments.

| ID | Requirement | Priority |
|---|---|---|
| FR-BAT-01 | Finance consolidates approved incentives into a monthly payroll/payment batch | Must |
| FR-BAT-02 | Batch summarizes totals by department and overall | Must |
| FR-BAT-03 | Finance Manager can finalize the batch | Must |
| FR-BAT-04 | Finalized batch records are locked from normal editing | Must |
| FR-BAT-05 | Status progresses to Ready for Payment, then Paid | Must |
| FR-BAT-06 | Employee monthly totals consolidate across incentive categories and adjustments | Must |

### 7.13 Month locking

| ID | Requirement | Priority |
|---|---|---|
| FR-LOCK-01 | Finance can lock a completed month | Must |
| FR-LOCK-02 | Locked month cannot be modified without an authorized reopening process | Must |

---

## 8. Business rules (all 12)

| Rule | Definition |
|---|---|
| BR-01 | Only active employees are selectable where active status is required |
| BR-02 | HOD sees only authorized departments |
| BR-03 | Sale-based incentives must be linked to a verified collection |
| BR-04 | Same payment / employee / incentive type cannot be duplicated |
| BR-05 | Approved records cannot be directly edited |
| BR-06 | Post-approval corrections require an adjustment |
| BR-07 | Return and rejection require comments/reasons |
| BR-08 | Every material action is recorded in audit history |
| BR-09 | Finance may lock a completed month; reopening requires authorization |
| BR-10 | Employee names originate from Employee Master |
| BR-11 | Source financial values are referenced, not re-typed across modules |
| BR-12 | No payment-card credentials/details collected, stored, processed, or displayed |

These 12 rules are the product’s constitution. If a screen or API violates one, it is wrong even if it “looks like the snapshot”.

---

## 9. Workflow and status model

### 9.1 Happy path

`DRAFT → SUBMITTED → FINANCE REVIEW → APPROVED → READY FOR PAYMENT → PAID`

### 9.2 Exception paths

`SUBMITTED → RETURNED TO HOD → RESUBMITTED → FINANCE REVIEW`  
`FINANCE REVIEW → REJECTED`

### 9.3 Official statuses

| Status | Meaning |
|---|---|
| Draft | Created by HOD, not submitted |
| Submitted | Received by Finance |
| Under Finance Review | Finance has started processing |
| Returned | HOD must correct / add information |
| Resubmitted | Corrected request sent again |
| Approved | Incentive approved |
| Ready for Payment | In / eligible for payroll queue |
| Paid | Payment processed |
| Rejected | Permanently rejected |
| Cancelled | Cancelled by an authorized user |

Cancelled exists in the status table even though the main diagrams do not draw it. Include it in the data model.

---

## 10. Data requirements

### 10.1 Core relationship chain (7.1)

`Employee → Department / Designation`  
`Client → Project → Sale → Payments[] → Verified Collection → Incentive Request → Incentive Items → Approval → Payment Batch`

### 10.2 Main entities the client listed (7.2)

The Word file names these 24 entities. This is the intended domain model:

1. `users`
2. `employees`
3. `departments`
4. `designations`
5. `roles`
6. `permissions`
7. `employee_reporting`
8. `clients`
9. `projects`
10. `services`
11. `sales`
12. `sale_employees`
13. `payments`
14. `incentive_plans`
15. `incentive_rules`
16. `incentive_requests`
17. `incentive_request_items`
18. `incentive_adjustments`
19. `approval_history`
20. `payment_batches`
21. `payment_batch_items`
22. `attachments`
23. `notifications`
24. `audit_logs`

### 10.3 Relationship constraints (7.3)

- One sale: one client; one project **or** multiple projects; multiple employees; multiple payments; multiple incentive items.
- Payments are a child collection, not two hardcoded columns.
- When an employee becomes inactive, historical incentive and audit rows must stay referentially intact (soft status change, no cascade-destroy).

---

## 11. Validation and controls (all 9)

| ID | Control |
|---|---|
| VC-01 | Employee exists and is eligible/active as required |
| VC-02 | Sale exists and belongs to the correct department/context |
| VC-03 | Payment/collection is Verified |
| VC-04 | Net collection > 0 for sale-based incentive |
| VC-05 | Applicable incentive policy/rule exists, or permitted manual process is used |
| VC-06 | Duplicate combination does not already exist |
| VC-07 | Period and department are correct |
| VC-08 | Return / Reject / Override / Adjustment capture mandatory reason where applicable |
| VC-09 | Finalized batches and locked months cannot be changed through normal edit operations |

Finance review is not a rubber stamp. The system must run these checks, then the human confirms.

---

## 12. Reports, dashboards, notifications

### 12.1 Phase-1 reports (Must)

| Report | Minimum content / filters |
|---|---|
| Incentive Register | Month, Department, Employee, HOD, Status, Incentive Type |
| Employee Incentive History | Complete employee incentive/payment history |
| Department Summary | Department, Total Sales, Net Collections, Total Incentive, Incentive % |
| HOD Submission Report | HOD, Requests, Approved, Returned, Rejected, Pending |
| Payment Report | Approved, Ready for Payment, Paid, Unpaid |

Phase 1 export: **Excel** for incentive register / basic reports.

### 12.2 Management dashboard (later-leaning, listed in SRS 9.2)

- Total Collections This Month
- Total Incentives
- Incentive / Collection %
- Pending Requests
- Approved
- Paid
- Department-wise Incentives
- Top Incentive Categories
- Monthly Trend

SRS 13.1 says **do not start development from dashboards/charts**. Role queues (HOD counts, Finance inbox counts) are Phase 3–4. Fancy management charts are Phase 6.

### 12.3 Notifications (section 10)

| Event | Notification |
|---|---|
| HOD submits request | New Incentive Request Submitted → Finance |
| Finance returns request | Incentive Request Returned → HOD |
| Finance/Manager approves | Incentive Request Approved → relevant users |
| Batch/payment processed | Incentive Batch Processed / payment update → relevant users |

Delivery: in-app + email. Email should minimize sensitive financial detail and send the user to the secured record.

Exact email service and templates are **open** (section 15).

---

## 13. Security and audit — every SR

| ID | Requirement | Priority |
|---|---|---|
| SR-01 | Authenticated, role-based access | Must |
| SR-02 | HOD access department/team scoped | Must |
| SR-03 | No card number, CVV, expiry, billing ZIP — collect/store/process/display | Must |
| SR-04 | May keep non-card payment metadata: method, status, date, transaction/reference | Must |
| SR-05 | Log every important action: user, action, entity, old value, new value, date/time, reason; IP/session optional if required | Must |
| SR-06 | Approved/paid financial records keep original values; use adjustments, not destructive edits | Must |
| SR-07 | Audit history and approval functions follow configured permissions | Must |

---

## 14. Non-functional requirements

The Word file is honest: **no numeric SLA was given**. No response-time target, concurrency, availability, backup retention, RPO/RTO, or browser/device list. Those must be confirmed before production acceptance.

What they did lock:

| ID | Requirement |
|---|---|
| NFR-01 | Scalability: multiple departments, multiple payments per sale, configurable rules, no schema redesign |
| NFR-02 | Maintainability: department rules are configuration, not hardcoded CE |
| NFR-03 | Traceability: approval, adjustment, audit history remain reviewable |
| NFR-04 | Data integrity: finalized/approved records protected from unauthorized direct modification |
| NFR-05 | Usability: role-specific dashboards/queues show only that user’s data and actions |
| NFR-06 | Extensibility: later bonuses, reimbursements, commissions, purchase approvals, recurring expenses without rewriting the core transaction model |

Your stack preference (Node, Express, Postgres, React Vite) fits these NFRs if:

- Postgres holds the 24-entity model with proper unique constraints and soft deletes/status.
- Express APIs are role-scoped (HOD cannot query another department).
- React Vite is split by role/feature, not one god page that copies the snapshot as a single screen.
- The snapshot is **four columns on one marketing page**. The real app is many screens (Appendix A). Do not build the production UI as one giant page.

---

## 15. MVP phases — the client’s own build order

They already sequenced the work. Follow this order.

| Phase | Scope | Exit outcome |
|---|---|---|
| **1** | Authentication, Roles, Departments, Employees | Login and department-based access works |
| **2** | Clients, Projects, Sales, Payments, Collection Verification, Excel migration/import | Finance transaction data exists and can be verified in-system |
| **3** | HOD Dashboard, Create Request, Select Sale/Employee, Enter Incentive, Submit | HOD can submit a complete incentive request |
| **4** | Finance Inbox, Review, Approve, Return, Reject, Comments, Validation | Finance can control and approve the workflow |
| **5** | Payment Batch, Paid Status, Employee Incentive Register, Excel Export, Basic Reports | Approved incentives can be processed and reported |
| **6** | Rules Engine, Auto Calculation, Multi-level Approval, Notifications, Advanced Dashboard, Audit Reports | Automation and advanced controls enabled |

### Official development priority sentence (13.1)

> Employee Structure → Roles & Permissions → Sales → Payments / Collections → Finance Verification → Incentive Request → Approval → Payment → Reports → Automation / AI

> Development should **not** start from dashboards/charts. The transactional and control foundation must be implemented first.

**Dummy employees belong in Phase 1.** Swap to employee API later without moving Phase 1’s exit outcome.

---

## 16. Acceptance criteria — the client’s UAT list

If these 12 pass, the client can accept the core product.

| ID | Criterion |
|---|---|
| AC-01 | Authorized HR can create/update employees. Inactive employees remain in historical records. |
| AC-02 | Finance can create a sale with **multiple payment records** and independently verify a payment. |
| AC-03 | HOD sees only authorized, verified, incentive-eligible collections. |
| AC-04 | Selecting a collection shows source sale/payment details; HOD cannot edit them. |
| AC-05 | HOD can select suggested employees, enter incentive items, save draft, submit. |
| AC-06 | Finance validation detects unverified payments, ineligible employees, and duplicates. |
| AC-07 | Finance can approve, return, or reject; return/reject requires reason. |
| AC-08 | Approved incentives enter a monthly payment batch and can become Paid. |
| AC-09 | Approved/paid incentive cannot be overwritten; correction uses adjustment. |
| AC-10 | Audit history shows material actions and changes. |
| AC-11 | Reports: incentive register, employee history, department summary, HOD submission, payment status. |
| AC-12 | No UI, API, or database field stores card number, CVV, expiry, or billing ZIP. |

---

## 17. Assumptions and open items the Word file refused to invent

The SRS says these are **intentionally undefined**. Do not silently fill them in code as if they were decided.

1. Exact incentive percentages / fixed amounts by department and role.
2. Approval amount thresholds, and which departments need Division Head / CFO / CEO.
3. Exact authority matrix: what Finance User can approve vs what needs Finance Manager.
4. Whether manual/special incentives **always** need higher approval, or only above a threshold.
5. Numeric NFRs: user count, concurrency, performance SLA, availability, backup/restore, retention, DR.
6. Final integration / import format for existing Finance Excel data.
7. Exact email delivery service and notification templates.
8. Whether IP/session in audit logs is mandatory or only when required.

Until those are answered, implement them as **configuration tables and settings**, with safe defaults that do not invent company policy (for example: Finance Manager final-approves everything in Phase 1; extra approvers stay configurable and off until values are given).

---

## 18. Appendix A — screens they want first

| Area | Screens |
|---|---|
| General | Login; Dashboard |
| Employees | Employee List; Add/Edit Employee; Employee Profile |
| Departments | Department management |
| Sales / Collections | Sales List; Create Sale; Sale Detail; Add Payment; Verify Payment |
| Incentives | My Requests; New Request; Request Detail; Returned Requests |
| Finance | Review Queue; Review Detail; Approved Requests; Payment Batches |
| Reports | Reports / Export |
| Administration | Settings |

This is the real IA. The snapshot is a poster of four of these screens glued together.

---

## 19. Appendix B — the one story the system must be able to tell

This is the client’s end-to-end example. It is the acceptance walkthrough they already wrote.

1. Finance records the **RFAB Weather Hardening** sale.
2. Word file numbers: contract **$4,650**, collection **$2,775**, net collection **$2,680.64**.  
   Snapshot numbers differ (contract $18,750, net $2,775). **Do not treat either as a business rule.**
3. Finance **verifies** the collection.
4. Sale team: Seller **Brock Thompson**, Closer **Addison Bruno**.
5. HOD selects that eligible collection.
6. HOD submits **$150** for Brock Thompson and **$100** for Addison Bruno.
7. System generates **INC-CE-2026-0045**.
8. System validates collection, employees, sale, department, duplicate status.
9. Finance approves.
10. Request moves to **Ready for Payment**.
11. It is included in the **September** batch, processed as **Paid**.
12. It remains in employee history and audit records.

If this path cannot be completed without Excel or email, the product is not done.

---

## 20. Appendix C — how they want work traced

Requirement IDs are grouped:

`AUTH, EMP, DEPT, SALE, COL, PAY, HOD, RULE, FIN, DUP, MAN, ADJ, BAT, LOCK, SR, NFR`

They want these IDs reused in development tickets, QA test cases, and UAT evidence so every feature traces back to an approved requirement.

---

## 21. Snapshot vs Word file — decision table

Use this when a developer (or a future chat) is tempted to copy the picture.

| Topic | Snapshot | Word SRS | What to follow |
|---|---|---|---|
| Product name | Finance Incentive Management System | Same + IPS-USA | Both |
| Card data | Forbidden | Forbidden | Both — hard stop |
| Roles | Admin, HR, HOD, Finance User, Finance Manager, CEO/CFO optional | Super Admin + Division Head / CFO / CEO optional | **SRS** |
| Payments on sale | First Payment + Second Payment fields | `Payments[]` unlimited child records | **SRS** |
| Collection status | “Paid” / “Not Collected” | Pending / Received / Verified / Cancelled / Refunded / Partially Refunded | **SRS** |
| Incentive eligibility | “Verified by Finance” on HOD form | Only **Verified** collections | **SRS** (snapshot HOD side is closer than its sales form) |
| Net collection | Shown, but no formula | Collected − taxes/charges − other deductions | **SRS** |
| Sale team | Seller, Closer, Account Manager | + optional Additional Contributor | **SRS** |
| Payment methods | Zelle example | PayPal, Zelle, ACH, Wire, Cheque, Other | **SRS** |
| Request ID | INC-CE-2026-0045 | INC-{Dept}-{Year}-{Seq} | Both |
| HOD actions | Save Draft, Submit to Finance | Same + add/remove employees, types, comments | Both |
| Finance actions | Approve, Return, Reject | Same + mandatory reason on Return/Reject | **SRS** |
| Finance checks | 5 checklist ticks | 8 validation points including period, department, net > 0 | **SRS** |
| Manual/special incentive | Not shown | Must, with attachment | **SRS** |
| Adjustments | Not shown | Must | **SRS** |
| Month lock | Not shown | Must | **SRS** |
| Reports | One sample register + Excel | Five Phase-1 reports + Excel | **SRS** |
| Email alerts | Optional | In-app + email required; email body minimized | **SRS** |
| Dashboards first | Big marketing dashboard look | Do not start from dashboards | **SRS** |
| One-page portal | Four columns on one canvas | Many role-specific screens | **SRS** screens, snapshot for visual cues only |
| Contract example $ | $18,750 | $4,650 | Neither — sample data |
| Employee source | Master implied | Master required; no free-type names | **SRS** + your dummy-then-API plan |

---

## 22. What he wants, module by module, in plain language

### Super Admin / Settings

Set up the company skeleton: users, roles, permissions, departments, designations, incentive plans, approval routing, month lock, system settings, full audit log. This person is the only one who should be able to override a duplicate, and only with a mandatory reason.

### HR

Keep people data clean. Add/edit employees. Change status when someone resigns or is terminated. Never type incentive money. Never delete a person who already appears on an incentive.

### Finance User (daily Finance work)

Enter or import clients, projects, sales, and each real collection payment. Verify a payment only when it is real. Review HOD requests against the source sale. Stop bad requests (unverified money, inactive people, duplicates). Approve / return / reject. Help move approved items toward payroll.

### Finance Manager

Second / final financial authority. Approve adjustments. Finalize the monthly batch. See reports. Lock the month when the period is closed.

### HOD

Once a month (or as needed), open only their department’s verified collections, pick the ones that earned incentive, assign amounts to the right people, comment, save or submit. If Finance returns it, fix and resubmit. They never edit verified finance numbers.

### Division Head / CFO / CEO

Not in the default path. Turned on later by department or amount threshold. Snapshot shows this as optional; SRS agrees.

---

## 23. Two different “payments” — do not confuse them

The Word file uses “payment” for two objects. The snapshot mixes the words. The data model must keep them separate.

| Object | Who pays | Module | Status vocabulary |
|---|---|---|---|
| **Collection payment** | Client pays IPS-USA | Sales / Collections | Pending, Received, Verified, Cancelled, Refunded, Partially Refunded |
| **Incentive payroll payment** | IPS-USA pays employee | Payroll / Payment Batch | Approved → Ready for Payment → Paid |

Sale-based incentive is allowed only after a **collection payment is Verified**.  
Employee money is paid only after the **incentive request is Approved** and placed in a batch.

---

## 24. Employee API later — how that fits the client’s ask

The client requires:

- a real Employee Master
- selection from master, never free text
- soft status instead of delete
- historical records remaining intact

You will not have the live employee API at the start. That does **not** change the client requirement. It only changes the **source**.

Correct approach:

1. Create `employees` (and related designation/department/reporting) in Postgres with the FR-EMP-01 fields.
2. Seed dummy employees (Brock Thompson, Addison Bruno, Mark Watson, plus a few other departments) so Appendix B can be demonstrated.
3. Hide employee writes behind a repository / service. HR screens write to that service.
4. When the API arrives, the service reads/syncs from the API. Incentive, sale, and approval tables keep storing `employee_id`, not names copied as the source of truth.
5. Display names can be denormalized for historical snapshots if needed, but selection still comes from master.

---

## 25. Recommended technical direction (your stack, mapped to their NFRs)

This section is **your** implementation preference applied to **their** requirements. The Word file did not name Node, Postgres, Express, or React.

| Layer | Choice | Why it fits FIMS |
|---|---|---|
| API | Node.js + Express | Role-scoped REST (or REST + later jobs) for masters, sales, requests, approvals, batches |
| DB | PostgreSQL | Relational integrity for 24 entities, unique index on Sale+Payment+Employee+Type, month locks, audit |
| Web | React + Vite (latest) | Role-based SPA, fast builds, screen-per-route matching Appendix A |
| Auth | Session or JWT + RBAC | FR-AUTH-01 / SR-01 |
| Files | Local/object storage for attachments | Manual/special incentive attachments |
| Export | Excel generation on API | Phase 1 reports |
| Mail | Configurable provider later | Notifications Phase 6 / when templates exist |
| Architecture | Modular monolith first: `auth`, `employees`, `sales`, `incentives`, `payroll`, `reports`, `audit` | Matches their phase order; can split later without rewriting the transaction model |

Quality / speed / security expectations implied by you + SRS:

- Server-side validation for every VC / FR-FIN-03 check (never trust the UI checklist).
- Row-level department scope for HOD.
- Soft status on employees.
- Immutable approved amounts; adjustments as new rows.
- Audit log on create/update/status-change of financial entities.
- No card-shaped fields in schema, DTOs, or forms.
- Indexes on request status, department, period, sale/payment foreign keys so queues stay fast.

**Do not implement a single-page clone of the snapshot.** That picture is a sales/explainer canvas. The real product is the Appendix A screen set plus the phase order in section 13.

---

## 26. Suggested first build slice (after this MD, when you say start)

This is not extra scope. It is the SRS Phase 1 exit, plus dummy employees:

1. Auth + roles (Super Admin, HR, HOD, Finance User, Finance Manager).
2. Departments + designations.
3. Dummy Employee Master with FR-EMP fields and statuses.
4. RBAC so HOD is department-scoped and HR cannot enter incentive money.

Then Phase 2 sales/payments. Then Phase 3 HOD request. Then Phase 4 Finance. Then Phase 5 payroll/reports.

Phase 6 stays last: rules auto-calc, multi-level approval, notifications polish, advanced dashboard, audit reports.

---

## 27. Open questions to take back to Division Head

Ask these before treating configuration as decided. They are the same gaps the SRS already listed, plus snapshot conflicts.

1. Confirm official role name: **Admin** vs **Super Admin**, and whether **Division Head** is a login role from day one or only a future approver slot.
2. Confirm Finance User vs Finance Manager approval matrix.
3. Confirm whether HOD may enter any amount in Phase 1 (manual rates) or some CE percentages already exist that must be loaded.
4. Confirm Excel import layout for current Finance files.
5. Confirm which number set is the demo canon: Appendix B ($4,650 / $2,775 / $2,680.64) or the snapshot ($18,750 / $2,775).
6. Confirm email: required at first go-live, or in-app only until Phase 6.
7. Confirm employee API contract timing and unique employee key (employee code vs numeric id).
8. Confirm numeric NFRs if they have any production target (users, browsers, uptime).

Until those answers arrive, the safe reading is: **Word SRS Musts + dummy employees + Node/Express/Postgres/React Vite**, snapshot used only as visual intent.

---

## 28. Final statement — what he wants

He wants a **secure internal finance system for IPS-USA** that turns a messy HOD-email-Excel incentive process into a controlled chain:

**people and departments are mastered → sales and collections are recorded and verified by Finance → HODs request incentives only against verified money and real employees → Finance validates and decides → approved money is batched, paid, locked, reported, and audited → nothing is overwritten, nothing is duplicated, and no card data ever enters the system.**

The snapshot is the picture of that story.  
The Word file is the contract of that story.  
This markdown is the working narration of both.

When you want to start coding, start at **SRS Phase 1**, not at the snapshot dashboard.
