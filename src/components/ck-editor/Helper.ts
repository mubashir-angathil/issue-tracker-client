/* eslint-disable no-unused-vars */
import {
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import { colors } from "../../utils/helpers/configs/Colors";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Define an interface that extends EditorConfig
export interface RhfCkEditorProps<TField extends FieldValues> {
  name: Path<TField>;
  control: Control<TField>;
  label: string;
  rules?: Record<string, unknown>; // Update the type based on your rules
  required?: boolean;
  height?: string;
  onBlur?: (description: string) => void;
}

// Configuration for CKEditor toolbar.
export const editorConfiguration = {
  toolbar: [
    "undo",
    "redo",
    "|",
    "heading",
    "|",
    "bold",
    "italic",
    "|",
    "numberedList",
    "bulletedList",
  ],
};

// Custom hook for CKEditor functionality
export const useCkEditorComponent = () => {
  // Handle editor content blur
  const handleEditorBlur = <TField extends FieldValues>(
    _: any,
    editor: ClassicEditor,
    field: ControllerRenderProps<TField, Path<TField>>,
    onBlur?: RhfCkEditorProps<FieldValues>["onBlur"],
  ) => {
    const content = editor.getData();
    onBlur && onBlur(content);
    field.onBlur();
  };

  // Handle editor content change
  const handleEditorChange = <TField extends FieldValues>(
    _: any,
    editor: ClassicEditor,
    field: ControllerRenderProps<TField, Path<TField>>,
  ) => {
    const content = editor.getData();
    field.onChange(content);
  };

  // Handle editor content focus
  const handleEditorOnFocus = (_: any, editor: ClassicEditor) => {
    editor.editing.view.change((writer: any) => {
      writer.setStyle(
        { border: `2px solid ${colors.primary}` },
        editor.editing.view.document.getRoot(),
      );
    });
  };

  // Adjust editor height on ready
  const handleEditorOnReady = (editor: ClassicEditor, height?: string) => {
    editor.editing.view.change((writer: any) => {
      writer.setStyle(
        {
          height: height ? height : "200px",
          color: "white",
          "background-color": "transparent",
        },
        editor.editing.view.document.getRoot(),
      );
    });
  };

  // Return functions for use in RhfCKEditorComponent
  return {
    handleEditorOnFocus,
    handleEditorChange,
    handleEditorOnReady,
    handleEditorBlur,
  };
};
