# Next.js E-Commerce Frontend Development Rules

## 1. Project Overview

Build a production-ready **E-Commerce website with a powerful Admin Panel** using **Next.js**.

The project must prioritize:

* **SEO**
* Performance
* UI/UX
* Clean architecture
* Scalability
* Maintainability
* Responsive design
* Accessibility
* Bilingual support
* Optimized API communication

**SEO is a first-class requirement and one of the highest priorities of the entire project.**

Do not treat SEO as an optional feature or something to add later.

---

# 2. Technology Stack

Use:

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Axios**
* **Zustand**
* Next.js App Router
* Next.js Metadata APIs
* Server Components where appropriate

Prefer native Next.js capabilities whenever they solve the problem cleanly.

Do not introduce additional libraries without a real reason.

---

# 3. Next.js Architecture

Use the modern **Next.js App Router**.

Prefer:

* Server Components by default
* Client Components only when interactivity or browser APIs require them
* Server-side data fetching where it benefits SEO and performance
* Static generation where appropriate
* Dynamic rendering where necessary
* Route-level loading states
* Route-level error handling
* Proper `not-found` handling

Do not turn the entire application into Client Components.

Do not add `"use client"` unless it is actually required.

**Do not use Client Components merely because a component fetches data or contains simple logic.**

---

# 4. Storefront and Admin Separation

The public storefront and Admin Panel must be architecturally separated.

Recommended structure:

```text
app/
├── (store)/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── checkout/
│   └── ...
│
└── admin/
    ├── dashboard/
    ├── products/
    ├── categories/
    ├── orders/
    ├── users/
    └── ...
```

The Storefront and Admin Panel may have different:

* Layouts
* Authentication requirements
* SEO requirements
* Navigation
* UX patterns
* Loading strategies

Do not unnecessarily mix Storefront and Admin concerns.

---

# 5. Feature-Based Architecture

The project must follow a **Feature-Based Architecture**.

Organize code around business features rather than only technical file types.

Example:

```text
src/
├── app/
├── features/
│   ├── auth/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── users/
│   └── ...
├── components/
├── lib/
├── stores/
├── services/
└── types/
```

Each Feature should contain its own relevant:

* API logic
* Components
* Types
* Hooks
* Validation
* Utilities
* State when necessary

Do not create unnecessary global abstractions.

Keep Features isolated and maintainable.

---

# 6. API & Axios

Use **Axios** for API communication.

Create a centralized Axios configuration.

Handle common concerns centrally:

* Base URL
* Authorization headers
* Request configuration
* Response handling
* Authentication errors
* Common API errors

Do not create Axios instances inside individual Components.

API services should be organized by Feature.

Example:

```text
features/
└── products/
    ├── api/
    │   ├── getProducts.ts
    │   ├── getProduct.ts
    │   ├── createProduct.ts
    │   └── updateProduct.ts
    ├── components/
    ├── types/
    └── ...
```

---

# 7. API Models

Frontend API models must follow the **Backend API Contract**.

Each API should have its own Request/Response models when appropriate.

**Do not use inheritance between API models.**

Do not create a generic base model simply because multiple models share similar fields.

Each API model should explicitly define its own structure.

Do not force multiple APIs into one shared model.

If Backend and Frontend contracts become inconsistent:

1. Identify the inconsistency.
2. Explain the problem.
3. Suggest the correct solution.
4. Do not silently invent a different API contract.

---

# 8. API Request Optimization

Avoid unnecessary API requests.

This is a high-priority requirement.

The application must:

* Prevent duplicate requests
* Avoid fetching the same data repeatedly
* Avoid requests caused by unnecessary re-renders
* Avoid unnecessary `useEffect` API calls
* Reuse already available data when appropriate
* Prevent multiple identical requests from being triggered simultaneously
* Avoid fetching data that is not needed
* Properly manage loading and error states

Before adding an API request, ask:

> Is this data already available somewhere in the application?

If yes, do not request it again unless fresh data is actually required.

Never trigger an API request merely because a Component re-rendered.

---

# 9. Server State vs Client State

Use **Zustand** for client-side/global state.

Do not put every API response into Zustand.

Zustand should primarily handle:

* UI state
* Cart state when appropriate
* User preferences
* Sidebar state
* Theme state
* Language state
* Temporary client-side state

Server data should not automatically become global Zustand state.

Avoid creating one huge global Zustand store.

Split stores by Feature or responsibility when necessary.

---

# 10. Tailwind CSS

Use **Tailwind CSS** as the primary styling solution.

Prefer Tailwind utilities over custom CSS.

**Do not create custom CSS classes when Tailwind already provides the required functionality.**

Use custom CSS only when:

* Tailwind cannot reasonably achieve the requirement
* A complex reusable visual effect genuinely requires it
* A third-party limitation requires it

Do not use inline styles unless there is a real technical reason.

---

# 11. Design System & Theme

The application must use a consistent **Design System / Color Theme**.

Do not hard-code random colors throughout Components.

Use the project's theme/tokens for:

* Primary
* Secondary
* Background
* Surface
* Text
* Muted Text
* Border
* Success
* Warning
* Error
* Accent

Components must remain consistent when the Theme changes.

Do not introduce random colors simply because they look good in one Component.

---

# 12. UI/UX

The design must be:

* Minimal
* Modern
* Professional
* Clean
* Visually rich enough
* Not excessively simple
* Easy to understand
* Consistent

Minimal does **not** mean empty or boring.

Use proper:

* Spacing
* Typography
* Visual hierarchy
* Contrast
* Alignment
* Component states
* Feedback
* Animations where appropriate

Do not add unnecessary visual elements.

Every UI element should have a clear purpose.

---

# 13. E-Commerce Storefront

The project is a real **E-Commerce website**, not merely a CRUD interface.

The storefront should include appropriate UX for:

* Home
* Product Listing
* Product Details
* Categories
* Search
* Cart
* Checkout
* Authentication
* User Account
* Orders

Product Cards should clearly communicate:

* Product image
* Product name
* Price
* Discount
* Final price
* Availability
* Relevant badges
* Main CTA

Product Detail pages should have a strong visual hierarchy and clear purchasing actions.

Cart and Checkout must be simple and frictionless.

---

# 14. SEO — HIGHEST PRIORITY

**SEO is one of the most important requirements of this project.**

The storefront must be designed **SEO-first from the beginning**.

Do not build the website first and attempt to add SEO afterward.

Every public page must be evaluated for:

* Crawlability
* Indexability
* Metadata
* Semantic HTML
* Rendering strategy
* Performance
* Structured data
* Internal linking
* URL structure
* Content quality
* Core Web Vitals

SEO requirements must be considered before implementing every public Storefront page.

---

# 15. SEO-Friendly Rendering

Use Next.js capabilities to ensure Search Engines can access important content.

For SEO-critical public pages:

* Prefer Server Components
* Use Server-Side Rendering where appropriate
* Use Static Generation where appropriate
* Use Incremental Static Regeneration where appropriate
* Avoid unnecessary Client-Side Rendering

Important content such as:

* Product name
* Product description
* Price
* Category
* Main image
* SEO content

must not depend unnecessarily on client-side JavaScript.

Do not make an SEO-critical page fully client-rendered without a strong technical reason.

---

# 16. Next.js Metadata API

Use Next.js Metadata APIs properly.

Public pages should have appropriate:

* Title
* Meta description
* Canonical URL
* Open Graph metadata
* Twitter metadata
* Robots metadata where required

Metadata must be dynamic when the page represents dynamic content.

Product pages must generate metadata based on the actual Product.

Category pages must generate metadata based on the actual Category.

Do not use identical metadata for every page.

---

# 17. Product SEO

Product pages are extremely important for SEO.

Each Product should have:

* SEO-friendly URL
* Unique title
* Unique meta description
* Proper H1
* Product description
* Optimized images
* Relevant structured data
* Canonical URL
* Breadcrumbs where appropriate
* Internal links to relevant categories/products

Prefer:

```text
/products/iphone-15-pro
```

over:

```text
/product?id=123
```

Use Slugs where the Backend/API supports them.

---

# 18. Category SEO

Category pages must also be SEO-friendly.

Each Category should have:

* SEO-friendly URL
* Unique metadata
* H1
* Useful category content
* Product listing
* Breadcrumbs
* Internal links
* Proper pagination handling

Do not create thin or meaningless Category pages solely for SEO.

---

# 19. Pagination & Filter SEO

Search Engines must not be allowed to crawl unlimited combinations of filters and query parameters unnecessarily.

Define a clear SEO strategy for:

* Pagination
* Sorting
* Filtering
* Search queries
* Category filters
* Price filters
* Attribute filters

For example:

```text
/products?page=2
/products?sort=price
/products?color=black&size=xl
```

must have a deliberate indexing strategy.

Do not accidentally create thousands of indexable URLs containing duplicate or near-duplicate content.

Use canonicalization and appropriate robots/indexing rules where necessary.

Important landing pages that have real SEO value should remain indexable.

---

# 20. Structured Data

Implement structured data where appropriate.

Use Schema.org structured data for relevant pages, including:

* Product
* Offer
* BreadcrumbList
* Organization
* WebSite

Product structured data should use real Backend data.

Where real data exists, Product Schema may include:

* Name
* Image
* Description
* SKU
* Brand
* Offers
* Price
* Currency
* Availability
* Rating
* Reviews

Never generate fake:

* Prices
* Ratings
* Reviews
* Availability
* Product information

---

# 21. Sitemap & Robots

Implement proper SEO infrastructure.

The project must provide:

* `sitemap.xml`
* `robots.txt`

The sitemap should contain only pages that should be indexed.

Do not include:

* Admin pages
* Login
* Register
* Cart
* Checkout
* Private user pages

Admin and private pages must not be exposed to Search Engines.

Use Next.js-native solutions where possible.

---

# 22. SEO-Friendly URLs

URLs must be:

* Human-readable
* Short
* Semantic
* Stable
* SEO-friendly

Avoid unnecessary query parameters for primary content pages.

Use proper redirects when URLs/Slugs change.

Avoid duplicate URLs pointing to the same content.

Properly handle:

* 404
* Redirects
* Canonical URLs
* Slug changes

---

# 23. Internal Linking

Internal linking is an important part of the SEO strategy.

Create meaningful links between relevant pages.

Examples:

```text
Home
 └── Category
      └── Product
           └── Related Products
```

Product pages should link to relevant:

* Categories
* Brands
* Related products
* Collections where applicable

Category pages should link to relevant Products and subcategories.

Use Breadcrumbs where appropriate.

Do not create artificial links solely for SEO.

Links must be useful to users.

---

# 24. SEO & Internationalization

The website must support:

* English
* Persian

Both languages must be SEO-friendly.

Support:

* RTL
* LTR
* Language-specific metadata
* Language-specific URLs
* Language-specific content
* Proper alternate language references

Do not simply translate the visible UI while leaving SEO metadata in one language.

Persian and English versions should be treated as proper localized pages.

---

# 25. Internationalization

All UI text must come from the i18n system.

Never hard-code UI text directly inside Components.

Support:

* English
* Persian
* RTL/LTR
* Localized dates
* Localized numbers
* Localized currency formatting

The layout must remain correct in both directions.

---

# 26. Image SEO & Performance

Images are extremely important for an E-Commerce website.

Use Next.js image optimization where appropriate.

Images should have:

* Proper dimensions
* Meaningful `alt`
* Appropriate loading strategy
* Responsive sizing
* Optimized formats where possible

Product image filenames should be meaningful when controllable.

Prefer:

```text
iphone-15-pro-black.webp
```

over:

```text
IMG_92837.webp
```

Do not lazy-load critical above-the-fold images unnecessarily.

Prevent layout shifts by reserving appropriate image dimensions.

---

# 27. Core Web Vitals

Core Web Vitals are an important part of the SEO and Performance strategy.

Pay particular attention to:

* **LCP**
* **CLS**
* **INP**

Avoid:

* Large blocking JavaScript
* Layout shifts
* Slow hero images
* Excessive client-side rendering
* Unnecessary third-party scripts
* Heavy components during initial load

SEO and performance must be considered together.

---

# 28. Performance

Performance is important for both UX and SEO.

Optimize:

* Initial JavaScript
* Bundle size
* Images
* Fonts
* API requests
* Rendering
* Client Components
* Third-party scripts

Use:

* Code splitting
* Lazy loading
* Dynamic imports
* Server Components
* Appropriate caching
* Optimized images

Avoid premature optimization, but never introduce obviously unnecessary performance costs.

---

# 29. Caching & Revalidation Strategy

Use an intentional caching strategy.

Do not make every request fully dynamic by default.

For public Storefront data, use appropriate:

* Caching
* Revalidation
* Static generation
* ISR
* Dynamic rendering

Examples:

* Product Details → Cache/Revalidate when appropriate
* Categories → Cache/Revalidate when appropriate
* Product Lists → Appropriate caching/revalidation
* Cart → Fresh client-specific data
* Checkout → Fresh and user-specific
* Orders → Fresh authenticated data
* Admin data → Fresh when required

Caching must never cause users to see incorrect sensitive information.

The caching strategy must consider both:

* SEO
* Data freshness

---

# 30. Button & Action Loading States

**Every button or interactive action that triggers an asynchronous operation must have its own loading state.**

This applies to:

* Create
* Update
* Delete
* Login
* Register
* Add to Cart
* Remove from Cart
* Checkout
* Submit
* Save
* Upload
* Download
* Search
* Filter actions when asynchronous
* Table actions
* Modal actions
* Drawer actions
* Any other API-triggering action

Rules:

* Every async action must provide clear visual feedback.
* Prevent duplicate clicks while loading.
* Prevent duplicate API requests caused by repeated clicks.
* Loading state should be local to the action whenever possible.
* Do not make the entire page appear loading when only one action is processing.
* Independent actions must have independent loading states.
* Buttons may display a spinner, loading icon, or appropriate loading text.
* Preserve button layout as much as possible while loading.
* Restore the normal state after success or failure.
* Always reset loading state when a request fails.
* Never leave a button permanently disabled because of an unhandled loading state.

For table rows, deleting one item must not unnecessarily put every Delete button into a loading state.

---

# 31. Admin Panel

The Admin Panel must be treated separately from the public Storefront.

Admin features may include:

* Dashboard
* Products
* Categories
* Orders
* Users
* Sellers
* Inventory
* Attributes
* Permissions
* Reports

Admin UI should prioritize:

* Productivity
* Tables
* Filters
* Search
* Pagination
* Forms
* Bulk actions
* Permissions
* Clear feedback

SEO is **not** a priority for private Admin pages.

Do not add unnecessary SEO complexity to authenticated Admin pages.

---

# 32. Admin Data Tables

Tables should support appropriate:

* Pagination
* Sorting
* Filtering
* Searching
* Loading states
* Empty states
* Error states

Search inputs should use debounce where appropriate.

Do not send an API request for every keystroke.

Do not refetch the entire page when only one table item changes.

Every asynchronous table action must have an independent loading state.

---

# 33. CRUD UX

CRUD operations must have consistent behavior.

For:

* Create
* Update
* Delete
* View

provide:

* Loading state
* Success feedback
* Error feedback
* Validation
* Confirmation for destructive actions

After mutations, update or invalidate affected data correctly.

Do not blindly reload the entire page after every mutation.

Every mutation button must prevent duplicate submissions while loading.

---

# 34. Permissions & Authorization

Admin actions must respect permissions.

Control:

* Routes
* Pages
* Buttons
* Actions
* Navigation items

based on permissions.

However:

**Frontend permission checks are only for UX.**

The Backend must remain the final authority for authorization.

Never assume that hiding a button provides security.

---

# 35. Forms & Validation

Forms must provide:

* Client-side validation
* Clear field errors
* Loading state
* Disabled submit state during submission
* Backend validation error handling

Prevent duplicate form submissions.

Every submit button must display an appropriate loading state while the request is running.

---

# 36. Error Handling

Error handling should be consistent throughout the application.

Handle:

* Network errors
* Authentication errors
* Authorization errors
* Validation errors
* Not Found
* Server errors
* Unexpected errors

Provide meaningful user feedback.

Do not expose technical stack traces or sensitive Backend information to users.

Every async action must recover correctly from errors and reset its loading state.

---

# 37. Loading & Empty States

Every asynchronous UI should consider:

* Loading
* Success
* Empty
* Error

Use appropriate:

* Skeletons
* Spinners
* Empty states
* Error states

Avoid showing a blank page while data is loading.

Do not cause major layout shifts during loading.

Buttons must have their own loading states even when the surrounding page also has a loading state.

---

# 38. Responsive Design

The entire application must be responsive.

Support:

* Mobile
* Tablet
* Desktop
* Large screens

The Storefront should be **Mobile-First**.

The Admin Panel should also remain usable on smaller screens, even if its primary target is Desktop.

Do not simply shrink Desktop layouts for Mobile.

Adapt the UX appropriately.

---

# 39. Accessibility

Follow accessibility best practices.

Use:

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Proper labels
* Accessible buttons
* Proper form labels
* `aria-*` attributes where necessary
* Sufficient contrast

Loading states must also be accessible.

Where appropriate, communicate loading state using:

* `aria-busy`
* Accessible loading text
* Proper button semantics

---

# 40. Component Architecture

Components should have clear responsibilities.

Avoid:

* Huge Components
* God Components
* Excessive prop drilling
* Unnecessary abstractions
* Generic components created prematurely

Do not create a `GenericTable`, `GenericForm`, `BaseComponent`, etc. simply because two Components currently look similar.

Create shared abstractions only when there is a **real and stable reuse pattern**.

Prefer explicit and readable code over excessive abstraction.

---

# 41. TypeScript

Use TypeScript properly.

Avoid `any` whenever possible.

Types should accurately represent:

* API requests
* API responses
* Component props
* Form values
* State
* Configuration

Do not use TypeScript just to silence errors.

Types must reflect the actual application contract.

---

# 42. Security

Never expose sensitive information in the frontend.

Do not hard-code:

* API secrets
* Private keys
* Database credentials
* Sensitive configuration

Use environment variables appropriately.

Do not expose sensitive data through client-side code unnecessarily.

Do not leave sensitive information in `console.log`.

Remember that all frontend code is ultimately visible to the client.

---

# 43. Analytics

The E-Commerce architecture should support analytics events such as:

* Product View
* Product Search
* Category View
* Add to Cart
* Remove from Cart
* Begin Checkout
* Purchase

Analytics implementation must:

* Avoid blocking page rendering
* Avoid harming Core Web Vitals
* Avoid unnecessary duplicate events
* Respect privacy requirements
* Be easy to extend

---

# 44. Production Error Monitoring

Production errors should be observable and traceable without exposing sensitive information to users.

Error monitoring should help identify:

* API failures
* Rendering errors
* Client-side errors
* Authentication problems
* Critical checkout failures

Do not expose internal error details in the UI.

---

# 45. Environment Management

Environment-specific configuration must not be hard-coded.

Use appropriate environment variables for:

* API URLs
* Environment configuration
* Public configuration
* Analytics configuration

Never commit secrets to the repository.

---

# 46. Testing

Important business flows should be testable.

Prioritize testing for:

* Authentication
* Product Search
* Product Listing
* Product Details
* Add to Cart
* Cart
* Checkout
* Orders
* Admin CRUD
* Permissions

Use appropriate Unit, Integration, and E2E testing where valuable.

Do not add tests merely for the sake of coverage.

Prioritize critical business logic and user journeys.

---

# 47. SEO Validation

After implementing every important public page, verify:

* Is the main content present in the initial HTML/rendered output?
* Is the Title correct?
* Is the Meta Description unique and relevant?
* Is the Canonical URL correct?
* Is there a correct H1?
* Is the heading hierarchy correct?
* Is Structured Data valid?
* Is the page crawlable?
* Is the page indexable when it should be?
* Are unnecessary query URLs controlled?
* Are internal links present?
* Are Breadcrumbs implemented where appropriate?
* Do images have meaningful alt text?
* Is the page fast?
* Does the page avoid unnecessary Client Components?
* Are Core Web Vitals considered?
* Does the page work correctly in both English and Persian?

**SEO validation is mandatory for important public pages.**

---

# 48. Existing Project Conventions

Before changing code:

1. Inspect the existing project structure.
2. Understand existing conventions.
3. Reuse existing patterns when they are good.
4. Avoid unnecessary refactoring.
5. Do not rewrite working code without a reason.

Do not introduce a completely different architecture into an existing Feature.

---

# 49. Backend Contract

The Backend is the source of truth for API contracts.

If a frontend requirement exposes a problem in the Backend:

1. Identify the problem.
2. Explain the issue.
3. Suggest a Backend improvement.
4. Do not silently invent a different API contract.
5. Do not modify Backend assumptions without confirmation.

Frontend models must remain synchronized with the actual Backend API.

---

# 50. Development Rules

Before implementing a feature, consider:

1. Is the architecture Feature-Based?
2. Is the API contract correct?
3. Is the API request actually necessary?
4. Can existing data be reused?
5. Is Zustand actually needed?
6. Should this be a Server Component or Client Component?
7. Does this page need to be indexed?
8. Is the page SEO-friendly?
9. Are metadata and structured data correct?
10. Is the URL SEO-friendly?
11. Is the caching strategy appropriate?
12. Are unnecessary filter/query URLs controlled?
13. Are internal links present?
14. Is the UI responsive?
15. Does RTL/LTR work?
16. Do both Persian and English work?
17. Does the design follow the Theme?
18. Is the implementation accessible?
19. Is the implementation performant?
20. Is the implementation unnecessarily complex?
21. Does every async action have an appropriate loading state?
22. Can the user accidentally trigger duplicate requests?
23. Does the implementation negatively affect Core Web Vitals?
24. Does the public page remain crawlable and indexable?

---

# 51. Critical Priority Order

When making architectural or implementation decisions, prioritize:

1. **SEO**
2. **Correct Next.js rendering strategy**
3. **Core Web Vitals & Performance**
4. **Correct API Contract**
5. **User Experience**
6. **Accessibility**
7. **Feature-Based Architecture**
8. **API Request Optimization**
9. **Caching & Revalidation**
10. **Responsive Design**
11. **Internationalization**
12. **State Management**
13. **Visual Consistency**
14. **Code Simplicity**

---

# 52. Final Principle

Do not optimize only for making the feature work.

Every feature must be evaluated from five perspectives:

### Business

Does it solve the actual E-Commerce/Admin requirement?

### UX

Is it intuitive, responsive, fast and pleasant to use?

### Technical

Is it maintainable, performant and consistent with the architecture?

### SEO

If it is a public page, can Search Engines efficiently crawl, understand, index and rank it?

### Interaction Feedback

If an action is asynchronous, does the user clearly understand that the operation is in progress?

The final goal is:

> **Build a production-ready Next.js E-Commerce platform with a powerful Admin Panel, SEO-first storefront architecture, excellent Core Web Vitals, modern UI/UX, Feature-Based architecture, Axios API communication, Zustand client state management, Tailwind CSS, bilingual Persian/English support, RTL/LTR support, strong accessibility, optimized API requests, intentional caching and revalidation, independent loading states for every asynchronous action, strong internal linking, structured data, proper sitemap and robots configuration, and clean maintainable code.**

**SEO must never be sacrificed for convenience when implementing public storefront pages.**

**Every public page must be built with SEO, performance, crawlability and indexability in mind from the beginning.**

**Every asynchronous user action must provide immediate and clear loading feedback and must prevent duplicate requests while processing.**
