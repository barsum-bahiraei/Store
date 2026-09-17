import { lazy, Suspense } from "react";

const EditorWrapper = lazy(() => import("./rich-text-editor.client"));

export interface RichTextEditorProps {
  data: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function RichTextEditor(props: RichTextEditorProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-32 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
          Loading editor...
        </div>
      }
    >
      <EditorWrapper {...props} />
    </Suspense>
  );
}
