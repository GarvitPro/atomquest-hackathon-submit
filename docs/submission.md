# AtomQuest Submission Pack

## Deliverables

| Requirement | Status | Value |
| --- | --- | --- |
| Live / hosted demo URL | Ready | https://atomquest-eight.vercel.app |
| Source code repository | Ready | https://github.com/GarvitPro/atomquest-hackathon-submit |
| Architecture diagram | Ready | `docs/architecture.png` and `docs/architecture.svg` |
| Login credentials | Ready | See below |

## Single Document Submission

Submit `docs/AtomQuest_Submission_Document.docx` as the single required document. It contains the working link, source code repository link, and architecture diagram inline.

## Demo Credentials

All demo users use the password `demo123`.

| Role | Email | Password |
| --- | --- | --- |
| Employee | `employee@atomquest.demo` | `demo123` |
| Manager | `manager@atomquest.demo` | `demo123` |
| Admin / HR | `admin@atomquest.demo` | `demo123` |

The login screen also provides role account buttons, so reviewers can quickly switch between Employee, Manager, and Admin journeys.

## Local Verification

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run dev
```

Open `http://localhost:3000`.

## Publish Checklist

1. Create a remote repository and push this project.
2. Deploy the pushed project to Vercel, Netlify, Render, or another Next.js host.
3. Replace the pending URL rows above with the final links.
