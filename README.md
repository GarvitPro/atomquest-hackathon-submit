# AtomQuest Goal Setting & Tracking Portal

My AtomQuest 1.0 submission for the goal-setting and tracking problem statement. It covers goal creation, L1 approval, quarterly achievement tracking, HR governance, audit logs, notifications, analytics, and CSV/XLSX reporting.

## Submission Deliverables

| Requirement | Status |
| --- | --- |
| Live / hosted demo URL | https://atomquest-eight.vercel.app |
| Source code repository | https://github.com/GarvitPro/atomquest-hackathon-submit |
| Architecture diagram | [`docs/architecture.png`](docs/architecture.png), [`docs/architecture.svg`](docs/architecture.svg) |
| Login credentials / role journeys | Available below and on the login screen |

For the single-document submission, use [`docs/AtomQuest_Final_Submission.docx`](docs/AtomQuest_Final_Submission.docx).

## Demo Credentials

All demo users use the password `demo123`.

| Role | Email | Password |
| --- | --- | --- |
| Employee | `employee@atomquest.demo` | `demo123` |
| Manager | `manager@atomquest.demo` | `demo123` |
| Admin / HR | `admin@atomquest.demo` | `demo123` |

The login page includes one-click role account buttons for quickly switching between the Employee, Manager, and Admin demo journeys.

## Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, lucide-react
- NextAuth v5 Credentials provider for the sample role accounts
- React Hook Form + Zod for goal-sheet validation
- TanStack Table, Recharts, ExcelJS
- tRPC router boundaries and a Prisma schema for a database-backed version
- Local demo data adapters, with `.env.example` entries for Neon, Upstash, Resend, Entra ID, and Teams

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
