
# Architecture Documentation PDF

Produce a single downloadable PDF that walks through every layer of the "To The Moon With English" frontend, explaining what each folder/file is responsible for. The PDF will be saved to `/mnt/documents/architecture.pdf` and surfaced as an artifact.

## What the PDF will contain

1. **Cover & Overview**
   - Project name, stack (React 18 + Vite + TS + Tailwind + shadcn/Radix + React Query)
   - High-level diagram: `main.tsx → App.tsx → Providers → Router → Pages → Components → Hooks → API → Laravel backend`

2. **Project structure tree**
   - Annotated `src/` tree (folders only + key files) so the user sees the whole map at a glance.

3. **Section-by-section breakdown** — for each, the role + the files involved:
   - `src/main.tsx` & `src/App.tsx` — bootstrap, providers (QueryClient, Auth, Language, Tooltip, Toaster), routing
   - `src/config/` — `api.ts` (BASE_URL, ASSET_BASE_URL, `resolveAsset`)
   - `src/api/` — `client.ts` (ApiClient, Bearer token, error handling), `auth.ts`, `courses.ts`, `course.ts`, `dashboard.ts`, `feedback.ts`, `quizz.ts`
   - `src/context/` — `AuthContext.tsx` (user, login/logout/register, token persistence)
   - `src/i18n/` — `LanguageContext.tsx` + `translations.ts` (EN/AR, RTL switching)
   - `src/hooks/` — `useCourses`, `useDashboard`, `use-toast`, `use-mobile` (React Query usage pattern)
   - `src/types/` — `auth.ts`, `course.ts`, `feedback.ts` (shape contracts with backend)
   - `src/pages/` — Index, Courses, CourseDetails, CoursePlayer, Login, Register, Dashboard, PlacementTest, QuizResult, NotFound (route-level role of each)
   - `src/components/` — layout (Navbar, Footer, HeroSection, CTABanner, WhyChooseSection), feature (PopularCourses, Testimonials, FeedbackList, NavLink), `ProtectedRoute`
   - `src/components/ui/` — shadcn primitives (note that these are presentational, theme-driven)
   - `src/data/` — static fallbacks (`coursesData.ts`, `quizData.ts`)
   - `src/lib/utils.ts` — `cn()` helper
   - `src/index.css` + `tailwind.config.ts` — design tokens, Poppins, blue theme, RTL

4. **Data flow walkthroughs** (small diagrams)
   - Auth flow: Login form → `api/auth` → `ApiClient` → token in localStorage → `AuthContext.user`
   - Courses flow: `Courses.tsx` → `useCourses` → `api/courses` → Laravel → response mapped + `resolveAsset` for images
   - Protected route flow: `ProtectedRoute` reads `useAuth()` → redirects if no user

5. **Conventions & constraints**
   - Always use `ApiClient` (not raw fetch)
   - No progress tracking / checkboxes (project rule)
   - i18n + RTL must be respected
   - JSX snippets only in chat (user maintains plain JS locally)

## Technical execution

- Use Python with `reportlab` (Platypus) to build the PDF with proper headings, code blocks, and an ASCII architecture diagram.
- Brand styling: blue accent (#2563eb-ish to match project), Helvetica family (Poppins not embeddable in reportlab default), clean section headers.
- After generation: convert to images with `pdftoppm` and visually QA every page (overflow, clipping, contrast), iterate until clean.
- Output: `/mnt/documents/architecture.pdf`, then emit `<presentation-artifact>` so the user can download it.

No source code in the project will be modified.
