# RSBK Online — Master Project Handover & Laptop Continuity Dossier

> **Prepared for**: Dr. Milind Chatrabhuji  
> **Repository**: [MilindChatrabhuji/RSBK-web](https://github.com/MilindChatrabhuji/RSBK-web.git) (Branch: `main`)  
> **Live Website**: [https://rsbk-online.web.app](https://rsbk-online.web.app)  
> **Firebase Project Target**: `rsbk-online`  
> **Date**: October 24, 2026  
> **Conversation ID**: `b499811b-2f39-4e2b-957c-38857550e8c0`  

---

## 1. Executive Summary & Purpose

This dossier provides a comprehensive reference and onboarding guide to seamlessly continue developing, maintaining, and deploying the **RSBK Online** web platform from your home laptop during leave, with **zero loss of context**.

RSBK Online is an advanced academic and clinical portal dedicated to **Rasashastra and Bhaishajya Kalpana (RSBK)** — the pharmaceutical and pharmacological branch of Ayurveda. The website serves:
- **BAMS Undergraduate students** (AyUG-RB curriculum).
- **MD / MS Postgraduate scholars** (AYPG-AB-RB Sem II, AYPG-RB Sem III–VI, and PG Final Year Old Scheme).
- **Ayurveda Educators & Faculty** (NCISM competency-based education, Bloom's Taxonomy, and Miller's Pyramid).
- **Ayurvedic Practitioners & Researchers** (Classical treatises, evidence-based studies, and preparation demonstration videos).

---

## 2. Live System Architecture & Infrastructure

| Component | Provider / Tool | Configuration Details |
| :--- | :--- | :--- |
| **Hosting** | Google Firebase Hosting | Project: `rsbk-online`<br>Live URL: `https://rsbk-online.web.app`<br>Version Retention: `1` release kept |
| **Source Control** | GitHub | `https://github.com/MilindChatrabhuji/RSBK-web.git`<br>Default branch: `main` |
| **Authentication** | Firebase Authentication | Google Identity Provider (1-Click Sign-in), email sign-in fallback |
| **Database** | Firebase Cloud Firestore & Realtime DB | `database.rules.json` enforces authenticated reads/writes |
| **SEO & Indexing** | Google Search Console | Verified via `google7510e72075793a4d.html` + HTML verification meta tag<br>`sitemap.xml` covering 12 academic sections |
| **Payments** | Razorpay Gateway | Configured in `features.js` / `membership.js` |
| **Email Service** | Google Apps Script Web App | Setup documented in `GOOGLE_APPS_SCRIPT_SETUP.md` |

---

## 3. How to Resume Work on Your Home Laptop (5-Minute Quickstart)

When you open your home laptop, follow these steps to be up and running immediately:

### Step 1: Clone or Pull the Repository
```bash
git clone https://github.com/MilindChatrabhuji/RSBK-web.git
cd RSBK-web
```
*(If already cloned, just run `git pull origin main`)*

### Step 2: Restore Full Antigravity Brain Context
To restore the exact conversation history, task logs, and all 58 user-uploaded screenshots to your home laptop's Antigravity environment, run **either**:

**Option A — Using Python:**
```bash
python docs/restore_antigravity_brain.py
```

**Option B — Using Windows PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File docs\restore_antigravity_brain.ps1
```

This will automatically unzip `docs/brain_backup/rsbk_brain_full_backup.zip` directly into your home laptop's `%USERPROFILE%\.gemini\antigravity\brain\b499811b-2f39-4e2b-957c-38857550e8c0` folder. When you open Antigravity on your home laptop, the entire project memory will be active.

### Step 3: Resuming via Antigravity or VS Code
- If using **Antigravity**: Launch the workspace `RSBK-web`. The agent will recognize the full trajectory and conversation.
- If using **VS Code / Cursor / ChatGPT / Claude**: Point your assistant to `docs/PROJECT_HANDOVER.md` and `docs/FULL_CONVERSATION_CHRONICLE.md`.

### Step 4: Deploying Updates to Firebase from Home
On your home laptop, if you have Node.js and the Firebase CLI installed:
```bash
firebase login
firebase deploy --only hosting --project rsbk-online
```
*(If using portable Node.js, point directly to `node.exe firebase.js deploy --only hosting --project rsbk-online`)*

### Step 5: Always Commit & Push Back to GitHub
As per the core workspace rules:
```bash
git add -A
git commit -m "<Descriptive message of what you updated>"
git push origin main
```

---

## 4. Key Solutions & Architecture Implemented to Date

### 1. The "Paywall Paradox" Solved
- **The Challenge**: We needed Googlebot and guest visitors to find, read, and index all book cards, curriculum blueprints, research abstracts, and glossary terms for SEO, while ensuring full PDFs and member downloads prompt a 1-click Google sign-in.
- **The Solution**: 
  - Schema.org `CollectionPage` structured data with `isAccessibleForFree` metadata was added to all key pages.
  - Cards, titles, descriptions, and cover images render fully for guests and crawlers.
  - Clicking "Read PDF" or "Download PDF" prompts a Google Sign-in modal if the user is unauthenticated, while pre-rendering the complete page content behind it.

### 2. Classical RSBK Subject Encyclopedia (`glossary.html`)
- Built a standalone Classical Encyclopedia containing 50 foundational RSBK terms (e.g., *Shodhana, Marana, Bhasma, Kupipakva Rasayana, Putapaka, Asava-Arishta, Sneha Kalpana*).
- Features Sanskrit devanagari diacritics, classical Ayurvedic references (*Sharngadhara Samhita, Rasaratnasamucchaya, Bhaishajya Ratnavali*), category filtering pills, and instantaneous search.
- Database is modularized in `public/glossary-data.js`.

### 3. UI Clearance & Top Bar Offset Fix
- Fixed persistent top-navbar overlap by establishing a global CSS variable `--page-top-clearance: 6.75rem` across all pages.
- Set the `.academic-preview-banner` top margin to `5.75rem auto 1.5rem`, ensuring that warning boxes and academic notices are never clipped by the header.

### 4. Auth-Gated Pages Fallback
- `membership.html` and `profile.html` now display elegant sign-in invitation cards when opened without authentication, resolving the issue where pages previously appeared blank.

---

## 5. Comprehensive Academic Inventory

### Authored Textbooks by Dr. Milind Chatrabhuji
Located in `public/assets/books/` and featured on `public/students.html`:

| Title | Academic Level / Role | Pages | Key Features |
| :--- | :--- | :--- | :--- |
| **Textbook of Pharmacology and Pharmacy Management** | PG Final Year · Paper IV (Old Syllabus) | **533** | 18 Chapters, Point-wise Study Notes, University Questions 2018–2026, Model Answers, 120 MCQs |
| **Applied Basics of Rasashastra and Bhaishajya Kalpana** | MD/MS Ayurveda · Semester II (AYPG-AB-RB) | **507** | 8 Modules, 42 Units, 16 Credits, Unit-by-Unit Study Notes |
| **ABQ Question Bank for Applied Basics of RSBK** | MD/MS Ayurveda · Semester II | **248** | 53 Case ABQs, 10 Analytical LAQs, 1 Complete University Solved Paper |
| **Practical Training Proformas for AyPG-AB-RB** | MD/MS Ayurveda · Semester II | **318** | Printable Proformas for all 47 Practical Training Activities |

### Official NCISM Curricula
Located in `public/assets/curriculum/`:
- **AyUG-RB (BAMS Second Professional)**: 118 Pages (Course Outcomes CO1–CO4, 36 Units, Practical Blueprints)
- **AYPG-AB-RB (MD/MS Semester II)**: 102 Pages (8 Modules, 42 Units, 16 Credits, 47 Competencies)
- **AYPG-RB (MD/MS Semesters III–VI)**: 309 Pages (Advanced Specialty Papers I to IV)

### Faculty Pedagogical Handbooks (`teachers.html`)
- Handbooks mapping NCISM competencies across **Bloom's Revised Taxonomy (Levels 1–6)** and **Miller's Competency Pyramid (Knows, Knows How, Shows How, Does)**.

---

## 6. Complete Repository File Structure

```text
RSBK.web.app/
├── .firebaserc                          # Firebase target project binding (rsbk-online)
├── .gitignore                           # Git ignore rules (node_modules, firebase caches)
├── AGENTS.md                            # Autonomous agent workspace rules & constraints
├── database.rules.json                  # Firebase Realtime Database security rules
├── firebase.json                        # Firebase hosting configuration (public: "public")
├── GOOGLE_APPS_SCRIPT_SETUP.md          # Setup guide for automated transactional emails
│
├── docs/                                # Handover & Continuity Package (Non-deployed)
│   ├── PROJECT_HANDOVER.md              # <-- This master dossier
│   ├── FULL_CONVERSATION_CHRONICLE.md   # <-- 114-turn complete prompt/response transcript
│   ├── restore_antigravity_brain.py     # <-- Python 1-click context restore script
│   ├── restore_antigravity_brain.ps1    # <-- PowerShell 1-click context restore script
│   ├── brain_backup/
│   │   └── rsbk_brain_full_backup.zip   # Full 31 MB archive of Antigravity brain workspace
│   └── context/
│       ├── transcript.jsonl.gz          # Gzipped compact conversation transcript
│       └── transcript_full.jsonl.gz     # Gzipped full conversation transcript
│
└── public/                              # Live Web Application Directory
    ├── index.html                       # Homepage & Academic Portal Hub
    ├── students.html                    # Student Hub (Curricula, Handbooks, 4 Textbooks)
    ├── teachers.html                    # Faculty Handbooks Hub (Bloom's & Miller's)
    ├── teachers-ug.html                 # Faculty Handbooks: Undergraduate Level
    ├── teachers-pg.html                 # Faculty Handbooks: Postgraduate Portal
    ├── teachers-pg-sem2.html            # Faculty Handbooks: PG Semester II
    ├── teachers-pg-sem3-6.html          # Faculty Handbooks: PG Semesters 3 to 6
    ├── books.html                       # Reference Books Digital Archive (Drive Explorer)
    ├── videos.html                      # Practical Video Hub (258+ Demonstrations)
    ├── research.html                    # Evidence & Research Publication Hub
    ├── glossary.html                    # RSBK Classical Subject Encyclopedia (50 Terms)
    ├── forum.html                       # Academic Discussion Board & Community Forum
    ├── membership.html                  # Pro Membership & Wallet Management
    ├── profile.html                     # User Account Profile Page
    ├── admin.html                       # Admin Management Dashboard
    │
    ├── glossary-data.js                 # 50 Classical RSBK terms & definitions database
    ├── script.js                        # Core frontend logic & Firebase client integration
    ├── features.js                      # UI enhancements, audio, notifications, paywall
    ├── email-service.js                 # Transactional email service client
    ├── auth-nav.js                      # Navigation bar & authentication state listeners
    ├── styles.css                       # Primary responsive stylesheet
    ├── features.css                     # Component stylesheets (cards, modals, badges)
    ├── sitemap.xml                      # Production XML sitemap (all 12 routes)
    ├── robots.txt                       # Search engine crawler permissions
    ├── google7510e72075793a4d.html      # Google Search Console HTML verification file
    ├── manifest.json                    # Progressive Web App (PWA) manifest
    └── assets/                          # Static assets (books, covers, icons, curricula)
```

---

## 7. Immediate Priorities When You Return

When you return or wish to work on the site from your home laptop, the primary tasks queued are:
1. **Google Search Console Indexing Monitoring**:
   - Verify that Googlebot indexes the submitted `sitemap.xml` and discovers `glossary.html` and `students.html`.
2. **Textbook of Pharmacology and Pharmacy Management Promotion**:
   - Consider adding a dedicated spotlight banner on the homepage hero or news ticker highlighting the newly added 533-page PG Final Year Paper 4 book.
3. **Further Encyclopedia Expansions**:
   - Add additional classical terms and formulations into `public/glossary-data.js` as needed.

---

*This dossier, along with `docs/FULL_CONVERSATION_CHRONICLE.md` and `docs/brain_backup/rsbk_brain_full_backup.zip`, guarantees 100% project continuity.*
