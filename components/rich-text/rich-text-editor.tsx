"use client";

import { Plate, PlateContent, usePlateEditor, type PlatePlugin } from "platejs/react";
import type { AnyPluginConfig, NodeComponents, Value } from "platejs";

import type { RichTextSchema } from "@/lib/rich-text/schema";
import { cn } from "@/lib/utils";
import { richTextEditorComponents, richTextEditorPlugins } from "./editor-kit";
import { RichTextToolbar } from "./rich-text-toolbar";

export interface RichTextEditorProps {
  // What the field may hold: its length limit and which toolbar buttons show.
  // The server sanitizes against the same schema.
  schema: RichTextSchema;
  // Initial content only. The editor owns its value after mount; changes come
  // back through `onChange`.
  initialValue: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  placeholder?: string;
  toolbar?: "compact" | "full";
  // The plugin set, for a feature with extra node types. Defaults to the
  // shared set; spread `richTextEditorPlugins` to add to it. Read once, when
  // the editor is created.
  plugins?: PlatePlugin<AnyPluginConfig>[];
  // Components for extra node types, merged over the shared ones.
  components?: NodeComponents;
  // Toolbar buttons for those extra plugins.
  toolbarExtras?: React.ReactNode;
}

export interface RichTextProviderProps
  extends Pick<RichTextEditorProps, "schema" | "initialValue" | "onChange" | "disabled" | "plugins" | "components"> {
  children: React.ReactNode;
}

// The editor without its frame, for a feature that lays the toolbar and the
// writing area out itself (the Club Codex's writing desk): children render
// inside Plate, so they can place a `RichTextToolbar` and a `PlateContent`
// where they like and use Plate's hooks.
export function RichTextProvider({
  schema,
  initialValue,
  onChange,
  disabled,
  plugins = richTextEditorPlugins,
  components,
  children,
}: RichTextProviderProps) {
  const editor = usePlateEditor({
    plugins,
    components: { ...richTextEditorComponents, ...components },
    value: initialValue,
    // Plate enforces this while typing, so the server-side check is a
    // backstop rather than the first line.
    maxLength: schema.maxLength,
  });

  return (
    <Plate
      editor={editor}
      readOnly={disabled}
      onValueChange={({ value }) => onChange(value)}
    >
      {children}
    </Plate>
  );
}

export function RichTextEditor({
  schema,
  initialValue,
  onChange,
  disabled,
  placeholder,
  toolbar = "full",
  plugins,
  components,
  toolbarExtras,
}: RichTextEditorProps) {
  return (
    <RichTextProvider
      schema={schema}
      initialValue={initialValue}
      onChange={onChange}
      disabled={disabled}
      plugins={plugins}
      components={components}
    >
      <div
        className={cn(
          "rounded-lg border border-input bg-background",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          disabled && "opacity-50",
        )}
      >
        {!disabled && (
          <RichTextToolbar
            schema={schema}
            variant={toolbar}
            className="border-b border-input px-1.5 py-1"
          >
            {toolbarExtras}
          </RichTextToolbar>
        )}
        <PlateContent
          placeholder={placeholder}
          disableDefaultStyles
          className={cn(
            "min-h-32 w-full px-3 py-2 text-sm leading-relaxed outline-none",
            "[&_[data-slate-placeholder]]:text-muted-foreground",
          )}
        />
      </div>
    </RichTextProvider>
  );
}
