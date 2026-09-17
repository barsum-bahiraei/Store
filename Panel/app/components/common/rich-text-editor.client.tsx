import {
  ClassicEditor,
  Alignment,
  AutoLink,
  Bold,
  BlockQuote,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  HorizontalLine,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  Strikethrough,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Underline,
} from "ckeditor5";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";
import type { RichTextEditorProps } from "./rich-text-editor";

const plugins = [
  Alignment,
  AutoLink,
  Bold,
  BlockQuote,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  HorizontalLine,
  Italic,
  Link,
  List,
  ListProperties,
  Paragraph,
  Strikethrough,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Underline,
];

const toolbar = [
  "heading",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "fontSize",
  "fontColor",
  "fontBackgroundColor",
  "|",
  "alignment",
  "|",
  "numberedList",
  "bulletedList",
  "todoList",
  "|",
  "link",
  "insertTable",
  "blockQuote",
  "horizontalLine",
  "|",
  "undo",
  "redo",
];

export default function RichTextEditorClient({ data, onChange, disabled, placeholder }: RichTextEditorProps) {
  return (
    <div className="rich-text-editor overflow-auto rounded-xl border border-gray-300 dark:border-gray-700 [&_.ck-editor__editable]:min-h-40 [&_.ck-editor__editable]:rounded-none [&_.ck-editor__editable]:border-0 [&_.ck-editor__top]:rounded-t-xl">
      <CKEditor
        editor={ClassicEditor}
        data={data}
        disabled={disabled}
        config={{
          licenseKey: "GPL",
          plugins,
          toolbar,
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
          },
          fontSize: {
            options: [12, 14, 16, 18, 20, 24],
            supportAllValues: true,
          },
          list: {
            properties: { styles: true, startIndex: true, reversed: true },
          },
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"],
          },
          placeholder: placeholder ?? "",
        }}
        onChange={(_event: unknown, editor: { getData: () => string }) => onChange(editor.getData())}
      />
    </div>
  );
}
