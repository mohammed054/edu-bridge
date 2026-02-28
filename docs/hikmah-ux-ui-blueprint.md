# Hikmah School Parent-Teacher-Student Portal
## Premium UX/UI Blueprint

## 1. Product Vision
Hikmah School Portal is a structured communication system designed to replace fragmented chat threads with clear, role-based, AI-assisted communication. The experience feels institutional, calm, premium, and academically authoritative.

The product centers on one core journey:
- Students submit structured feedback with AI assistance.
- Teachers review and finalize communication.
- Parents receive clear, professional, actionable updates.
- Admins monitor trends and intervene early.

Every secondary feature exists to support this communication loop and student progress visibility.

## 2. Experience Principles
- Calm authority: minimal noise, clear hierarchy, no visual excess.
- Clarity before density: one clear purpose per view.
- Structured over conversational: form-based communication replaces chat chaos.
- Human control over AI: AI drafts and suggests, users always edit and decide.
- Contextual relevance: each role sees only what they need.
- Bilingual parity: Arabic RTL feels fully native, not mirrored afterthought.

## 3. Visual Design Language
### 3.1 Color System
- Base: `#FFFFFF` backgrounds.
- Soft neutrals: `#F7F7F5`, `#EFEFEA`, `#DCDCD6`.
- Primary text: `#1F2328`.
- Secondary text: `#5F6670`.
- Accent (institutional): `#0E4A3A` for primary actions and highlights.
- Supporting accent: `#C8A46A` for subtle premium emphasis.
- Success: `#2B7A57`.
- Warning: `#A8741A`.
- Error/Urgent: `#B54747`.
- Info: `#2F5E8A`.

Usage rules:
- Keep accent usage sparse and intentional.
- Avoid saturated blocks; prioritize neutral planes.
- Urgent states use color + label + icon, never color alone.

### 3.2 Typography
- Arabic and English editorial pairing with strong readability.
- Display heading style for page titles.
- Clean sans style for body and UI labels.
- Scale:
  - H1: 34/42, medium weight.
  - H2: 26/34, medium weight.
  - H3: 20/28, medium weight.
  - Body large: 17/28.
  - Body: 15/24.
  - Caption/meta: 13/20.
- Wide line-height and generous paragraph spacing.
- Numeric data uses tabular figures for dashboards/tables.

### 3.3 Layout, Spacing, and Surface
- 8px spacing system.
- Desktop content max width: 1360px.
- Standard page paddings:
  - Desktop: 32px.
  - Tablet: 24px.
  - Mobile: 16px.
- Card style:
  - Background: white.
  - Border: 1px `#ECEDE8`.
  - Radius: 14px.
  - Shadow: 0 4px 18px rgba(18, 24, 40, 0.05).
- Dividers: `#ECEDE8`, 1px.

### 3.4 Motion
- Transitions: 150-200ms.
- Easing: smooth ease-out.
- Effects:
  - Fade in/out for modals and panels.
  - Lift by 2-4px on card hover.
  - Soft highlight pulse for new notifications.
- No bounce, no scale pop, no flashy transitions.

## 4. Information Architecture
## 4.1 Global Top Bar (All Roles)
Elements from start to end in LTR (mirrored in RTL):
- Institution mark (minimal logo + school name).
- Page breadcrumb.
- Role and section context chip (example: "Teacher | Grade 8").
- Notification bell with unread badge.
- Settings icon.
- Profile cluster:
  - Circular profile photo.
  - Greeting text.
  - Role label.
  - Chevron menu: profile, language, logout.

Top bar behavior:
- Sticky on scroll.
- Subtle bottom border.
- Notification dropdown opens as right-aligned panel (left-aligned in RTL).

## 4.2 Sidebar Navigation by Role
All sidebars:
- Minimal line icons.
- Clear active state with soft tinted background.
- Section grouping with short labels.
- Collapsible on tablet; drawer on mobile.

Student sidebar:
- Dashboard
- Feedback
- Calendar
- Academic Summary
- Recent Notes

Teacher sidebar:
- Dashboard
- Classes
- Feedback Drafts
- AI Suggestions
- Calendar
- Reports

Admin sidebar:
- Dashboard
- Classes
- Subjects
- Schedules
- Broadcast Posts
- Reports

## 5. Core Experience: Feedback
## 5.1 Student Feedback Workspace
### Entry and First Impression
- Dashboard contains a dominant "Feedback" action card.
- Clicking opens a full-page workspace, not a popup.
- Header:
  - Page title: "Submit Feedback".
  - Context subtitle: class/subject and current term.
  - Optional "How this works" text link.

### Layout (Desktop)
- Left rail (26%): progress steps + previous submissions list.
- Main panel (48%): interactive feedback builder.
- Right rail (26%): AI preview and send summary.

### Step Flow
1. Category selection.
- Options as card buttons:
  - Academic
  - Behavior
  - Attendance
  - General
  - Urgent
- Selected card shows left border accent and check icon.

2. Sub-option selection.
- Dynamic chips based on chosen category.
- Supports multiple predefined issues.
- Includes "Other" with required text prompt.

3. Optional student note.
- Multiline input with placeholder:
  "Add context to help your teacher understand the situation."
- Character guidance appears below, not a strict hard stop.

4. AI draft generation.
- Primary button: "Generate AI Draft".
- Loading state:
  - Button disabled.
  - Inline shimmer in preview panel.
  - Label switches to "Creating Draft...".

5. AI draft review.
- AI output appears in a structured composer:
  - Subject line.
  - Main paragraph.
  - Suggested next step sentence.
- Controls:
  - Edit in place.
  - Regenerate.
  - Tone change dropdown (`Calm`, `Formal`, `Direct`).

6. Submission preview.
- "What will be sent" card:
  - Recipient: Teacher (and Parent if configured).
  - Category and urgency badges.
  - Timestamp preview.
- Optional visual summary card appears beneath:
  - Icon + short message + status tone.

7. Submit.
- Primary button: "Submit Feedback".
- Success state:
  - Full-width success banner.
  - Status moves to `Sent`.
  - Return shortcut to Dashboard.

### Left Rail: Submission Timeline
- List of previous submissions.
- Each row shows:
  - Category icon.
  - Title/snippet.
  - Status badge (`Draft`, `Sent`, `Reviewed`).
  - Date and time.
- Selecting an item opens detail drawer.

### Empty States
- First-time use:
  - Calm illustration placeholder.
  - Message: "No feedback submitted yet."
  - CTA: "Start your first feedback".

## 5.2 Teacher Feedback Drafts Workspace
### Entry
- Sidebar item "Feedback Drafts" includes count badge of pending drafts.

### Layout
- Header row:
  - Title.
  - Search by student name.
  - Filters: class, category, urgency, date.
- Main area split:
  - Draft list table/cards on left.
  - Draft detail editor on right.

### Draft List Item
- Student avatar + name.
- Category badge.
- Urgency marker.
- AI confidence/tone indicator (subtle text).
- Time submitted.
- Status: `Pending Review`, `Edited`, `Sent`.

### Draft Detail Panel
- Original student input block.
- AI-generated draft block (editable rich text area).
- Action row:
  - `Accept`
  - `Edit`
  - `Reject`
  - `Request Clarification`

### AI Tone Adjustment
- One-click chips:
  - Soften
  - Formalize
  - Emphasize Action
- Applying tone updates content with diff highlight for 2 seconds.

### Final Submission
- "Send to Parent" primary action.
- Confirmation modal includes:
  - Recipients.
  - Message summary.
  - Optional schedule send time.

## 5.3 Admin Feedback Intelligence Center
### Purpose
Central oversight for institutional communication quality and student support risk detection.

### Dashboard Blocks
- Total feedback volume.
- Pending reviews by teacher.
- Urgent incident count.
- Average teacher turnaround time.

### Filters
- Category
- Urgency
- Class
- Teacher
- Date range

### Trend Insight Panel
- AI-generated trend summary cards:
  - Most frequent issue this week.
  - Classes with rising incident patterns.
  - Students with repeat urgent submissions.
- "Students needing attention" list with priority rank.

### Drill-down Behavior
- Clicking a trend opens filtered table view with export option.
- Admin can assign follow-up owner (teacher/counselor).

## 6. Secondary Product Areas
## 6.1 Dashboards
### Student Dashboard
- Welcome header and day summary.
- Stats row:
  - Feedback sent.
  - Pending teacher responses.
  - Upcoming events.
- Quick actions:
  - Submit Feedback
  - View Calendar
  - View Academic Summary
- Recent notes feed with unread tags.

### Teacher Dashboard
- Stats row:
  - Drafts pending review.
  - Messages sent this week.
  - Students flagged by AI.
- Class snapshot cards:
  - Attendance trend.
  - Homework completion trend.
  - Recent urgent feedback count.
- Quick links:
  - Open Feedback Drafts
  - Generate AI Suggestions
  - Open Reports

### Admin Dashboard
- Institution-wide KPIs.
- Communication health indicators.
- Broadcast performance summary.
- Top priority student attention panel.

## 6.2 Academic Overview
### Student View
- Simplified, friendly performance summary.
- Subject cards with:
  - Current average.
  - Homework completion bar.
  - Trend arrow.
- AI insight strip:
  - "You improved in Math this month."
  - "Attendance drop in Week 3; check with your teacher."

### Teacher View
- Detailed analytics:
  - Grade distributions.
  - Assignment completion heatmap.
  - Attendance correlation.
- AI flags:
  - Sudden decline.
  - Consistent missing work.
  - Recovery progress.

## 6.3 Calendar and Schedule
### Core Views
- Week view (default).
- Month list hybrid for mobile.

### Event Types
- Classes
- Exams
- Homework deadlines
- School events
- Meetings

### Interaction
- Hover reveals event quick details on desktop.
- Click opens event side panel:
  - Title, time, location, class.
  - Notes and attached resources.
- Teachers can edit class schedule entries.

### Visual System
- Neutral base with soft subject colors.
- High contrast for current day.
- Urgent event markers use outlined warning badge.

## 6.4 Broadcast Posts (Admin)
### Composer
- Audience selector:
  - Whole school
  - Selected classes
  - Selected grades
- Message editor with optional attachments.
- AI assist:
  - "Generate Draft Announcement"
  - Tone presets (`Formal`, `Friendly`, `Urgent`)

### Preview and Publish
- Card preview exactly as recipients will see it.
- Scheduled send option.
- Confirmation flow with recipient count.

## 7. AI Integration Surfaces
## 7.1 AI Feedback Drafting
- Triggered in student and teacher workflows.
- Presents structured message blocks.
- Always editable before save/send.

## 7.2 AI Academic Interpretation
- Converts performance and attendance data into concise insights.
- Highlights concern levels with plain language.

## 7.3 AI Visual Cards
- Auto-generated visual summaries:
  - Progress charts.
  - Feedback category distribution.
  - Improvement spotlight card.

## 7.4 AI Trend and Risk Insights
- Aggregated for teachers/admins.
- Identifies recurring issues and attention priorities.
- Clearly labeled as AI-generated recommendation.

## 8. Notifications and Message Center
## 8.1 Notification Types
- New feedback draft.
- Teacher review completed.
- Urgent feedback submitted.
- Broadcast posted.
- Schedule change.

## 8.2 Notification UI
- Bell icon with numeric unread badge.
- Dropdown panel sections:
  - Today
  - This week
  - Earlier
- Item structure:
  - Icon
  - Title
  - One-line summary
  - Timestamp
  - Unread dot

## 8.3 Behavior
- Clicking notification deep-links to exact screen state.
- Mark as read per item or all.
- Critical items remain pinned until opened.

## 9. Standard Interaction Patterns
## 9.1 Buttons
- Primary: filled institutional accent.
- Secondary: white with neutral border.
- Tertiary: text-only.
- Hover: small lift + shadow increase.
- Disabled: muted text and no shadow.

## 9.2 Inputs
- Large touch-friendly fields.
- Label always visible above field.
- Inline help text below.
- Validation messages:
  - Clear language.
  - Placed directly under field.

## 9.3 Tables and Lists
- Sticky headers on long lists.
- Column chooser for advanced users.
- Compact and comfortable density switch.

## 9.4 Modals and Side Panels
- Fade in with slight upward motion.
- Background scrim at low opacity.
- Escape and close icon always available.

## 10. State Design
## 10.1 Empty States
- Calm, instructional copy.
- One primary CTA.
- Optional secondary "Learn more" link.

## 10.2 Loading States
- Skeleton blocks matching final layout.
- Loading text indicates what is happening.

## 10.3 Error States
- Quiet but clear warning panel.
- Action options:
  - Retry
  - Save as draft
  - Contact support (for critical failures)

## 10.4 Offline or Timeout Recovery
- Non-blocking banner indicates connection issue.
- Draft autosave status remains visible.

## 11. Accessibility and RTL
## 11.1 Accessibility
- WCAG AA contrast minimum.
- Keyboard-first navigation for all interactive controls.
- Visible focus rings on all focusable elements.
- Form controls include descriptive labels and assistive hints.
- Charts have text summaries.

## 11.2 RTL Arabic Native Experience
- Full layout mirroring, including navigation flow.
- Arabic typography tuned for readability and spacing.
- Icons that indicate direction mirror correctly.
- Mixed Arabic/English data fields remain legible and aligned.
- Date/time formatting follows locale.

## 12. Responsive Behavior
## 12.1 Desktop (1200px+)
- Three-column feedback workspace.
- Persistent sidebar and top bar.

## 12.2 Tablet (768-1199px)
- Two-column feedback layout.
- Sidebar collapses to icon rail.
- Filters move into collapsible drawer.

## 12.3 Mobile (<768px)
- Single-column stacked flow.
- Bottom-sheet interactions for filters and quick actions.
- Sticky bottom primary action in feedback flow.
- Timeline appears as tab, not side rail.

## 13. Microcopy and Tone
- Professional, concise, non-punitive.
- Parent-facing content emphasizes support and action steps.
- Student-facing content remains respectful and encouraging.
- Urgent communication is direct and unambiguous.

## 14. Screen Inventory
### Student Screens
- Dashboard
- Feedback Workspace
- Feedback History Detail
- Calendar
- Academic Summary
- Recent Notes
- Notifications Center
- Settings/Profile

### Teacher Screens
- Dashboard
- Classes Overview
- Student Feedback Drafts
- AI Suggestions
- Calendar
- Reports
- Notifications Center
- Settings/Profile

### Admin Screens
- Dashboard
- Classes
- Subjects
- Schedules
- Broadcast Posts
- Reports
- Feedback Intelligence Center
- Notifications Center
- Settings/Profile

## 15. Final UX/UI Quality Checklist
- Student feedback flow is fully interactive, structured, AI-generated, and editable.
- Teacher can review, edit, reject, and submit AI suggestions.
- Admin can monitor trends, filter deeply, and identify high-risk cases.
- Calendar and schedule are integrated and role-aware.
- Academic overview is simplified for students and detailed for teachers.
- AI visual cards are present in feedback and performance contexts.
- Notifications are clear, actionable, and include unread indicators.
- Arabic RTL is fully native across layout, typography, and interaction.
- Premium, calm, institutional visual identity is consistent end-to-end.
- Every page avoids placeholder content and maintains purpose-driven clarity.
