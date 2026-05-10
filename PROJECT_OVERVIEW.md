# 🚀 FlowForge: AI-Powered SaaS Workflow Generator

## 📌 Project Overview
**FlowForge** is a high-performance, premium SaaS platform designed to automate the creation of business workflows. Users "intake" their business domain (e.g., Medical Clinic, Educational School), describe their operations through a guided AI interface, and the platform generates a fully-functional digital twin of that workflow, including roles, permissions, data tracking, and notification systems.

---

## 🛠 Tech Stack
- **Frontend Framework**: React (Vite-based)
- **Styling**: Tailwind CSS (Mobile-first, responsive)
- **Animations**: Framer Motion (Micro-interactions, page transitions)
- **State Management**: Zustand (Atomic, fast global state)
- **Data Fetching**: TanStack Query (v5)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Typography**: Poppins (Headings) & Inter (Body/UI)
- **Routing**: React Router DOM (v6)

---

## 📂 Architecture & Directory Structure
The project follows a modular, feature-based architecture to ensure scalability:

### `src/app/`
- `router.tsx`: The central routing table. Uses **lazy loading** and **Suspense** for all page-level components, wrapped with a custom `ProtectedRoute` to enforce authentication.
- `App.tsx`: Root component with provider wrapping.

### `src/components/`
- `layout/`: High-level structural components (AppShell, AuthLayout, Sidebar, Footer).
- `auth/`: Contains `ProtectedRoute` for authenticating route access.
- `shared/`: Reusable components (Logo, Stepper, NotFound 404 page, etc.).
- `ui/`: Design System "Atoms" (Button, Input, Slider, Switch, Badge, Avatar, Modal, Skeleton).

### `src/features/`
- `auth/`: Login, Registration, and Email Verification logic.
- `projects/`: Project Hub logic, including `ProjectCard` and `CreateProjectModal` (powered by Zod).
- `preview/`: Contains the `GeneratedAppLogin` component for simulating generated app authentication.

### `src/pages/`
- `auth/`: LoginPage, RegisterPage, VerifyEmailPage.
- `hub/`: ProjectHubPage (The Dashboard), SettingsPage (Account management).
- `intake/`: DomainSelectionPage, IntakeFormPage, GuidedIntakePage, IntakeReviewPage.
- `documents/`: DocumentExtractionPage.
- `theme/`: ThemeStudioPage.
- `spec/`: BlueprintReviewPage.
- `notifications/`: AlertsSetupPage.
- `generation/`: GenerationProgressPage.
- `preview/`: AppPreviewPage.
- `deployment/`: DeploymentHubPage.

---

## 🔄 Core Workflows

### 1. Authentication & Security
- **Flow**: Register -> Verify Email -> Login.
- **UI**: High-density forms with teal-primary branding.
- **State**: `authStore.ts` tracks user session and verification status.
- **Protection**: All `/hub` and `/project/*` routes are strictly wrapped in `<ProtectedRoute>`, bouncing unauthenticated users to `/login`.

### 2. Project Hub (The Dashboard)
- **Path**: `/hub`
- **Features**: Active projects grid, sidebar navigation, and a "New Project" modal powered by Zod schema validation.

### 3. Full 5-Step Intake & Generation Pipeline
All project generation pages live under `/project/:projectId/`.
- **Step 1: Setup (Domain Selection)**: Choosing between Clinic or School templates.
- **Step 2: Structural Data**: Granular selection of team roles, throughput sliders, and notification toggles (`/intake/form`).
- **Step 3: Guided Intake (Story & Data)**: 
    - AI-assisted detection of business roles and structured data models from freeform text (`/intake/story`, `/intake/data`).
- **Step 4: AI Extraction & Theme**: Extracting fields from uploaded PDFs and selecting a UI design system (`/documents`, `/theme`).
- **Step 5: Blueprint Review**: A comprehensive review studio for the entire generated app architecture (`/blueprint`).
- **Step 6: Alerts & Generation**: Configuring notification triggers and monitoring the real-time AI generation pipeline (`/alerts`, `/generating`).
- **Step 7: Interactive Preview**: An interactive, split-pane sandbox where users can view the generated app, switch between "Login" and "Dashboard" modes, and chat with an AI UI assistant to modify layouts (`/preview`).
- **Step 8: Deployment**: Final hand-off screen for setting up custom domains and exporting source code (`/deploy`).

---

## 🎨 Design System & Aesthetics
- **Color Palette**: Primary Teal (`#0F766E`), Secondary Indigo (`#4F46E5`), Accents Emerald (`#34D399`).
- **Principles**: 
    - **Glassmorphism**: Subtle blurs and borders.
    - **Micro-animations**: Extensive use of Framer Motion for hover scales, staggered list entrances, layout transitions, and error boundary states.
    - **Accessibility**: Strict WCAG 2.1 AA focus rings (`focus:outline-2 focus:outline-[#0F766E] focus:outline-offset-2`) across all interactive elements.

---

## 🧠 State Management (Zustand)
- `authStore`: User profile and auth state.
- `projectStore`: List of projects and currently active project.
- `intakeStore`: Persistent storage for the multi-step form data. Uses **Zustand Persist Middleware** with `sessionStorage`.

---

## 🚀 Key Implementation Notes for AI Agents
1. **Dynamic Branding**: Internal pages use `logo2.png` (secondary logo), while Auth/Landing pages use the primary branding.
2. **Global Error Handling**: A centralized `RouteError` component acts as the `errorElement` for all routes in React Router v6, catching crashes gracefully with a themed 404/500 UI.
3. **Form Validation Patterns**: We utilize `react-hook-form` bound with `zodResolver`. Refer to `CreateProjectModal.tsx` and `LoginPage.tsx` for the established pattern.
4. **Scrolling Architecture**: Deeply nested, high-density pages (like `BlueprintReviewPage` and `AlertsSetupPage`) rely on standard `min-h-screen` layouts with `sticky top-0` and `sticky bottom-0` elements, avoiding forced internal scrollbars on `<main>`.

---

## 📡 Roadmap Status
- ✅ **Batch 1**: Auth flows, Project Hub, Infrastructure
- ✅ **Batch 2**: Settings, Domain Selection, Guided Intake (Part 1)
- ✅ **Batch 3**: Data Tracking, Rules, Intake Review, Document Upload, Theme Studio
- ✅ **Batch 4**: Blueprint Review, Alerts Setup, Generation Progress, App Preview, Deployment Hub
- ✅ **Batch 5**: Generated App Login Preview, 404 Page, Global Error Boundaries, Zod Validations, and Platform Polish
- 🎉 **PLATFORM COMPLETED**
