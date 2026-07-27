# agents.md

## General

- Keep the code clean, simple, readable, and maintainable.
- Follow existing project conventions before introducing new patterns.
- Do not modify unrelated files.
- Avoid unnecessary abstractions, dependencies, and complexity.
- Reuse existing components, utilities, and logic whenever possible.
- Never duplicate code when a clean reusable solution exists.

## Architecture

- Use a **feature-based architecture**.
- Keep feature-specific components, composables, services, types, and views inside their feature.
- Put genuinely shared code in shared directories.
- Keep business logic separate from UI components.
- Keep API communication inside services/composables, not directly inside presentational components.
- Keep global state limited to state that actually needs to be shared.

Example:

src/
├── app/
├── features/
│   ├── auth/
│   ├── users/
│   ├── products/
│   └── orders/
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
├── composables/
├── services/
├── types/
└── utils/

## Code Quality

- Use TypeScript properly.
- Avoid `any` unless absolutely necessary.
- Prefer small, focused components and functions.
- Use clear and meaningful names.
- Remove unused imports, variables, and dead code.
- Prefer simple solutions over clever solutions.

## UI/UX

- Follow the installed **UI/UX Pro Max** skill for UI and UX decisions.
- Use **Material Symbols** as the primary icon system throughout the application.
- Prefer Material Symbols over manually created SVG icons or other icon libraries.
- Keep the interface modern, clean, professional, consistent, and responsive.
- Reuse existing design patterns and components.
- Maintain consistent spacing, typography, colors, borders, and interactions.
- Avoid unnecessary animations, gradients, shadows, and decorative elements.
- Prioritize usability and accessibility.
- Handle loading, empty, error, and success states properly.
- Use the appropriate Material Symbols icon variant and weight to match the design.
- Do not use emoji as UI icons.

## Tailwind CSS

- Use **Tailwind CSS as the primary styling solution**.
- Prefer Tailwind utility classes over custom CSS.
- Do not create custom CSS when the same result can be achieved cleanly with Tailwind.
- Avoid inline `style` attributes unless there is a specific technical reason.
- Reuse existing Tailwind classes and project design patterns.
- Keep class lists readable and logically grouped.
- Use responsive Tailwind utilities for different screen sizes.
- Use Tailwind state variants such as `hover:`, `focus:`, `active:`, `disabled:`, and `dark:` when appropriate.
- Prefer Tailwind's spacing, typography, color, border, radius, shadow, and layout utilities instead of arbitrary CSS values.
- Avoid excessive use of arbitrary values such as `w-[...]`, `text-[...]`, or `bg-[#...]` unless genuinely necessary.
- If the same UI pattern appears repeatedly, extract it into a reusable component instead of duplicating long Tailwind class lists.
- Do not introduce another CSS framework or styling library unless explicitly requested.
- Keep custom CSS limited to cases where Tailwind cannot reasonably provide the required behavior.

## Responsive Design

- The application must work well on desktop, tablet, and mobile.
- Use responsive Tailwind utilities instead of hardcoded responsive CSS.
- Design mobile layouts intentionally rather than simply shrinking desktop layouts.
- Use appropriate breakpoints based on the actual UI requirements.

## Before Coding

1. Read the relevant files.
2. Understand the existing architecture and conventions.
3. Look for reusable components and logic.
4. Check existing Tailwind patterns before creating new ones.
5. Make the smallest clean change that solves the task.
6. Do not rewrite working code without a reason.

## After Coding

- Check for TypeScript and lint errors when available.
- Remove unused code.
- Verify that the implementation follows the existing architecture.
- Verify responsive behavior.
- Make sure unrelated functionality was not affected.

## Important

Follow this priority:

**Understand → Reuse → Implement → Verify**

Do not over-engineer.