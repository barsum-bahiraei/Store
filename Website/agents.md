# Project Development Rules

## 1. General Principles

* Write clean, readable, maintainable, scalable, and production-ready code.
* Follow the existing architecture, conventions, naming, and coding style.
* Before implementing anything, inspect the existing codebase and reuse existing components, hooks, services, types, utilities, and patterns when possible.
* Keep changes focused on the requested feature.
* Do not modify unrelated code or introduce unnecessary refactoring.
* Avoid unnecessary abstractions, dependencies, libraries, or architectural changes.
* Prefer simple, explicit, and maintainable solutions.
* Avoid duplicated logic and UI.

---

## 2. Architecture

Use **Feature-Based + Component-Based Architecture**.

Preferred structure:

```text
src/
├── app/
├── components/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── products/
│   ├── cart/
│   ├── wishlist/
│   ├── categories/
│   └── orders/
├── hooks/
├── lib/
├── services/
├── types/
└── utils/
```

Rules:

* Feature-specific code belongs inside its feature.
* Shared code belongs in global folders only when genuinely reused.
* Pages should compose components instead of containing large amounts of UI and business logic.
* Components must have a clear responsibility.
* Keep business logic, API communication, server state, and UI concerns separated.
* Do not create abstractions before they are actually needed.

Preferred flow:

```text
Page
 ↓
Feature Components
 ↓
Feature Hooks
 ↓
TanStack Query / Zustand
 ↓
Feature Service
 ↓
Axios
 ↓
API
```

---

## 3. Components

* Build UI from small, focused, reusable, and composable components.
* Reuse existing components before creating new ones.
* Avoid large monolithic components.
* Do not create components only to reduce file length.
* Keep API calls and complex business logic out of presentational components.
* Use clear and strongly typed props.
* Avoid excessive prop drilling and excessive component props.
* Create shared components only when there is a real reuse requirement.

---

## 4. TypeScript

* TypeScript is mandatory.
* Avoid `any` and unnecessary type assertions.
* Define types for API models, DTOs, props, state, and important function parameters.
* Reuse existing types instead of duplicating them.
* Use inference when it improves readability.
* Never use TypeScript to hide runtime or architectural problems.
* Remove unused imports, variables, functions, and dependencies.

---

## 5. State Management

Use the smallest appropriate state scope:

```text
Local UI State
    ↓
useState

Shared Client State
    ↓
Zustand

Server State
    ↓
TanStack Query
```

### Zustand

* Use Zustand only for shared client-side state.
* Keep stores feature-based and focused.
* Do not create one large global store.
* Do not use Zustand as an API cache.
* Avoid duplicated sources of truth.

Good use cases:

* Cart
* Wishlist
* Authentication client state
* User preferences
* Theme
* Shared UI state
* Multi-step client workflows

Do not put server data such as product lists or search results into Zustand when TanStack Query is appropriate.

---

## 6. API and Data Fetching

Use **Axios** as the only standard HTTP client.

* Use a centralized Axios instance.
* Never put raw Axios calls directly inside UI components.
* Organize API services by feature.
* Avoid unnecessary or duplicated API requests.
* Reuse cached data whenever possible.
* Avoid unnecessary `useEffect`-based data fetching.
* Run independent requests in parallel when appropriate.
* Avoid API waterfalls when requests are independent.
* Use request cancellation where appropriate.

Preferred:

```text
Component
 ↓
Feature Hook
 ↓
TanStack Query
 ↓
Feature Service
 ↓
Axios
 ↓
API
```

---

## 7. TanStack Query

Use TanStack Query for server state.

It should handle:

* Caching
* Request deduplication
* Loading and error states
* Refetching
* Cache invalidation
* Pagination
* Infinite queries

Use stable and meaningful query keys:

```ts
["products"]
["products", categoryId]
["products", { categoryId, page, pageSize }]
["product", productId]
```

After mutations, invalidate or update only the relevant queries.

Do not blindly invalidate the entire cache.

---

## 8. Search and Filtering

For search/autocomplete/filter APIs:

* Debounce user input.
* Avoid requests on every keystroke.
* Use appropriate minimum search length.
* Cancel obsolete requests when possible.
* Reuse cached results when appropriate.

---

## 9. UI/UX

UI/UX is a first-class requirement.

Use the existing design system and follow the **UI/UX Pro Max** guidelines.

Every UI should be:

* Modern
* Clean
* Consistent
* Responsive
* Accessible
* Visually balanced
* Production-ready

Consider:

* Visual hierarchy
* Typography
* Spacing
* Colors
* Responsive behavior
* Accessibility
* Hover/focus/active/disabled states
* Loading/error/empty states
* Mobile and desktop UX

Avoid:

* Random colors or spacing
* Excessive shadows or rounded cards
* Unnecessary gradients
* Excessive animations
* Inconsistent icons
* Generic/template-like UI
* Unnecessary decorative elements

---

## 10. Tailwind CSS

Use **Tailwind CSS** as the primary styling solution.

* Prefer Tailwind utility classes over writing custom CSS.
* Avoid creating CSS files unless absolutely necessary.
* Do not create custom CSS for something that Tailwind can handle.
* Keep styling close to the component.
* Reuse existing Tailwind patterns and design tokens.
* Avoid excessive arbitrary values when existing Tailwind utilities are sufficient.
* Create reusable components instead of duplicating long class combinations when appropriate.
* Only use custom CSS when Tailwind genuinely cannot provide a clean solution.

Preferred:

```tsx
<div className="flex items-center gap-4 rounded-lg p-4 shadow-sm">
```

Avoid:

```tsx
<div className="product-card">
```

with a separate CSS file when the same result can be achieved cleanly with Tailwind.

---

## 11. Responsive Design

All UI must work properly on:

* Mobile
* Tablet
* Desktop
* Large screens

Do not simply shrink desktop layouts for mobile.

Consider:

* Touch targets
* Navigation
* Typography
* Spacing
* Content priority
* Forms
* Tables
* Modals
* Component stacking

Avoid horizontal overflow.

---

## 12. Accessibility

Accessibility is mandatory.

* Use semantic HTML.
* Use `<button>` for actions.
* Use proper links for navigation.
* Provide meaningful `alt` text.
* Provide accessible form labels.
* Ensure keyboard accessibility.
* Maintain visible focus states.
* Do not rely only on color.
* Maintain sufficient contrast.
* Use ARIA only when semantic HTML is insufficient.

---

## 13. Loading, Error, and Empty States

Every asynchronous action must have an intentional state.

Use the smallest appropriate loading scope:

```text
Button
 ↓
Component
 ↓
Section
 ↓
Page
 ↓
Global
```

Prefer localized loading over full-page loading.

Examples:

```text
Save → Button Loading
Product List → Skeleton
Product Details → Skeleton
```

Rules:

* Prevent duplicate submissions.
* Disable the relevant action while loading.
* Preserve layout during loading.
* Use skeletons for content-heavy sections when appropriate.
* Keep unrelated UI interactive.
* Full-page loading should be rare.

Every relevant feature must also handle:

* Loading
* Error
* Empty
* Success
* Disabled
* Hover
* Focus
* Active states

---

## 14. Forms

Forms must provide:

* Clear labels
* Validation
* Actionable error messages
* Loading state
* Disabled state during submission
* Success feedback when appropriate
* Accessible inputs

Never silently fail form submission.

---

## 15. SEO

SEO is a critical requirement for all public pages.

Public pages should have:

* Unique title
* Unique meta description
* Canonical URL
* Proper heading hierarchy
* Semantic HTML
* Crawlable content
* SEO-friendly URLs
* Open Graph metadata where appropriate

Use:

```text
H1 → Page title
H2 → Major sections
H3 → Subsections
```

Important SEO content should be available in crawlable HTML.

For product pages, consider:

* SEO-friendly URLs
* Product structured data
* Price and availability
* Canonical URLs
* Optimized images
* Meaningful image alt text

Never add fake or misleading structured data.

---

## 16. Performance

* Avoid unnecessary API requests and re-renders.
* Optimize images.
* Use lazy loading where appropriate.
* Avoid unnecessarily large dependencies.
* Prefer server-side/static rendering when appropriate.
* Keep initial JavaScript and page load as small as reasonably possible.
* Do not sacrifice maintainability for micro-optimizations.

---

## 17. Security

Never expose:

* Secrets
* API keys
* Passwords
* Private tokens
* Sensitive configuration

in client-side code.

Never rely only on client-side validation or authorization.

Sensitive operations must be validated by the backend.

---

## 18. Dependencies

Before adding a dependency:

1. Check whether the project already has a solution.
2. Check whether the functionality can be implemented simply.
3. Prefer established and actively maintained packages.
4. Add dependencies only when there is a clear benefit.

---

## 19. Before Implementing

Before writing code:

1. Understand the requested feature.
2. Inspect the existing project structure.
3. Find related components.
4. Find existing hooks, services, types, and utilities.
5. Check existing API calls and cached data.
6. Check existing UI/design patterns.
7. Determine the correct feature location.
8. Reuse existing solutions where possible.
9. Implement the smallest reasonable change.

Do not immediately create new files without checking the existing codebase.

---

## 20. Before Finishing

Verify:

* TypeScript is clean.
* No unused imports or code exist.
* No duplicated logic was introduced.
* No unnecessary API requests were introduced.
* TanStack Query caching/deduplication is used appropriately.
* Zustand is used only for appropriate client state.
* Loading, error, and empty states exist where needed.
* Buttons have appropriate loading states.
* UI is responsive.
* Accessibility is considered.
* SEO requirements are satisfied for public pages.
* Tailwind is used instead of unnecessary custom CSS.
* UI follows existing design patterns and UI/UX Pro Max.
* No debug code or secrets remain.
* No unrelated files were changed.

---

## 21. Code Change Discipline

Always make the **smallest reasonable change** that fully solves the requested problem.

Do not:

* Refactor unrelated code.
* Rename unrelated files.
* Change existing APIs unnecessarily.
* Change architecture without a requirement.
* Add unnecessary dependencies.
* Add unnecessary CSS.
* Rewrite working code without a clear reason.

The final implementation must be:

```text
Feature-Based
+
Component-Based
+
Type-Safe
+
Clean
+
Maintainable
+
Tailwind-Based
+
Efficient
+
Responsive
+
Accessible
+
SEO-Friendly
+
Production-Ready
```

When choosing between a quick implementation and a clean, scalable, maintainable solution, prefer the latter.
## 11. Icons

Use **Material Symbols** as the standard icon system throughout the project.

* Prefer Material Symbols for all UI icons.
* Do not use random Unicode characters or emoji as UI icons.
* Do not mix multiple unrelated icon libraries unless there is a clear technical requirement.
* Reuse the project's existing Material Symbols configuration when available.
* Choose icons that clearly communicate their purpose.
* Keep icon style, size, weight, and alignment consistent across the application.
* Icons used for actions must remain accessible; provide appropriate labels or accessible text when the icon alone does not clearly communicate the action.

Preferred:

```tsx
<span className="material-symbols-outlined">
  shopping_cart
</span>
```

Avoid introducing another icon library when Material Symbols can provide the required icon.
## 20. Lint and Code Validation

After implementing or modifying code:

1. Run the project's configured **lint** command.
2. Check the output for all errors and warnings.
3. Fix all lint errors and warnings introduced by the changes.
4. Do not ignore, suppress, or disable lint rules just to make the lint command pass.
5. If a lint rule conflicts with the existing project conventions, follow the project's established configuration unless there is a clear reason to change it.
6. Re-run lint after fixing issues to verify that the code is clean.
7. Do not consider the task complete while there are unresolved lint errors or warnings caused by the changes.

The expected workflow is:

```text
Implement
   ↓
Run Lint
   ↓
Fix Errors & Warnings
   ↓
Run Lint Again
   ↓
Verify
```

Also run the appropriate type-check/build command when the project provides one, and fix issues introduced by the changes.
## 10.1 Color System and Design Tokens

Use a **centralized, consistent, and intentionally limited project-wide color palette**.

### Core Rule

**Never choose colors independently for individual components.**

Every new UI element must use the project's existing color system and semantic design tokens.

Before using any color:

1. Check the existing project color palette.
2. Check existing CSS variables and Tailwind design tokens.
3. Reuse an existing semantic token whenever possible.
4. Do not invent a new color just because it visually looks better.
5. Only introduce a new color when the existing palette genuinely cannot satisfy the requirement.
6. If a new color is required, add it to the centralized design system first.
7. Never define one-off colors directly inside a component.

### Semantic Color Tokens

The project should use semantic tokens such as:

* `primary` — main brand color and primary actions
* `secondary` — secondary actions and supporting UI
* `accent` — highlights and important visual emphasis
* `background` — application/page background
* `surface` — cards, panels, inputs, and elevated surfaces
* `foreground` / `text` — primary text
* `muted` — secondary and less important text
* `border` — borders and dividers
* `success` — successful operations and positive states
* `warning` — warnings and attention states
* `error` — destructive actions and errors
* `info` — informational states

### Color Usage Rules

* `Primary` must be used consistently for primary actions and brand elements.
* `Secondary` must be used for secondary actions and supporting elements.
* `Accent` should be used sparingly for visual emphasis.
* `Success`, `Warning`, `Error`, and `Info` must preserve their semantic meaning throughout the application.
* Do not use `Success`, `Warning`, `Error`, or `Info` colors for decorative purposes.
* Do not use a semantic color for a different meaning.
* Do not use color as the only way to communicate status or meaning.
* Maintain sufficient contrast between text, backgrounds, borders, and interactive elements.

### No Random Colors

Do NOT:

* Pick colors based on personal preference.
* Introduce arbitrary hex colors inside components.
* Use random Tailwind colors such as `blue-500`, `purple-500`, `orange-500`, etc. when an existing project token already represents that role.
* Mix unrelated color families across different pages.
* Create different shades of the same semantic color for individual components without adding them to the design system.
* Change button, card, input, badge, or text colors independently from the established palette.

Avoid:

```tsx
<button className="bg-[#ff6b35] text-white hover:bg-[#e85d2a]">
  Add to cart
</button>
```

Also avoid:

```tsx
<div className="bg-purple-500 text-blue-900 border-orange-300">
```

### Preferred Approach

Use semantic project tokens:

```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Add to cart
</button>
```

For surfaces:

```tsx
<div className="bg-surface text-foreground border-border">
```

For semantic states:

```tsx
<span className="text-success">
  Payment successful
</span>
```

### State Colors

Hover, focus, active, selected, disabled, and loading states must be derived from the existing color system.

Do not invent separate colors for component states.

Preferred:

```text
Primary
├── hover
├── active
├── focus
└── disabled
```

All states must remain visually related to the base semantic color.

### Centralized Palette

If the project already has a color system:

**Use it. Do not create another one.**

If the project does not have a color system:

1. Define a small palette first.
2. Define semantic tokens for that palette.
3. Configure the tokens centrally.
4. Use those tokens throughout the application.
5. Do not bypass the token system inside components.

Example:

```text
Design Tokens
│
├── Primary
├── Secondary
├── Accent
├── Background
├── Surface
├── Foreground
├── Muted
├── Border
├── Success
├── Warning
├── Error
└── Info
```

### New UI Decision Rule

When implementing a new page or component:

```text
New UI
  ↓
Check existing design tokens
  ↓
Reuse existing semantic color
  ↓
If no suitable token exists
  ↓
Check existing Tailwind/CSS variables
  ↓
If still unavailable
  ↓
Add the color to the centralized design system
  ↓
Use the new semantic token
```

**Never skip the design system and add a color directly to a component.**

### Design Consistency

All pages and components must visually belong to the same product.

The following must remain consistent across the application:

* Brand colors
* Semantic colors
* Text colors
* Background colors
* Surface colors
* Border colors
* Interactive states
* Hover states
* Focus states
* Disabled states
* Selected states

Do not create a new visual color language for individual pages or features.

### Palette Discipline

Keep the project's palette intentionally small.

**More colors do not mean better UI.**

Prefer:

```text
Small Palette
+
Semantic Tokens
+
Consistent Usage
=
Cohesive Product UI
```

Avoid:

```text
Random Colors
+
One-off Hex Values
+
Different Colors Per Component
=
Inconsistent UI
```

### Absolute Rule

**If a suitable color token already exists, use it.**

**Do not create a new color.**

**If a new color is genuinely required, add it to the centralized design system first and then use its semantic token.**

The AI must never introduce arbitrary colors directly into component code.
