"use client";

import {useEditor, EditorContent} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import {
    Bold, Italic, List, ListOrdered, Quote, Link2,
    Heading2, Heading3, Strikethrough, Minus, Undo, Redo,
    UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
    Highlighter, Code, RemoveFormatting,
} from "lucide-react";

type Props = {
    content: string;
    onChange: (value: string) => void;
    maxChars?: number;
    placeholder?: string;
};

function Divider() {
    return <div className="w-px h-5 bg-base-300 mx-1 shrink-0"/>;
}

function ToolBtn({onClick, active, title, children}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={title}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                active
                    ? "bg-base-content text-base-100"
                    : "text-base-content/50 hover:bg-base-200 hover:text-base-content"
            }`}
        >
            {children}
        </button>
    );
}

export default function TextEditor({content, onChange, maxChars, placeholder = "Commencez à taper..."}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({heading: {levels: [1, 2, 3]}}),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {class: "underline text-primary cursor-pointer"},
            }),
            Placeholder.configure({
                placeholder,
                emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-base-content/25 before:pointer-events-none before:float-left before:h-0",
            }),
            TextAlign.configure({types: ["heading", "paragraph"]}),
            Underline,
            Highlight.configure({multicolor: false}),
            ...(maxChars ? [CharacterCount.configure({limit: maxChars})] : []),
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-[280px] prose prose-sm max-w-none text-base-content",
            },
        },
        onUpdate: ({editor}) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const chars = maxChars ? (editor.storage.characterCount?.characters() ?? 0) : null;
    const charPercent = chars !== null && maxChars ? (chars / maxChars) * 100 : 0;
    const charColor = charPercent > 90 ? "text-error" : charPercent > 70 ? "text-warning" : "text-base-content/40";

    const handleSetLink = () => {
        const prev = editor.getAttributes("link").href ?? "";
        const url = window.prompt("URL du lien", prev);
        if (url === null) return;
        if (url === "") editor.chain().focus().unsetLink().run();
        else editor.chain().focus().setLink({href: url}).run();
    };

    return (
        <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-base-300 bg-base-100">
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-base-300 flex-wrap bg-base-100">

                <ToolBtn title="Annuler" onClick={() => editor.chain().focus().undo().run()}>
                    <Undo size={14}/>
                </ToolBtn>
                <ToolBtn title="Rétablir" onClick={() => editor.chain().focus().redo().run()}>
                    <Redo size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Titre H1"
                    active={editor.isActive("heading", {level: 1})}
                    onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                >
                    <span className="text-[11px] font-bold leading-none">H1</span>
                </ToolBtn>
                <ToolBtn
                    title="Titre H2"
                    active={editor.isActive("heading", {level: 2})}
                    onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                >
                    <Heading2 size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Titre H3"
                    active={editor.isActive("heading", {level: 3})}
                    onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                >
                    <Heading3 size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Gras"
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Italique"
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Souligné"
                    active={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Barré"
                    active={editor.isActive("strike")}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Surligner"
                    active={editor.isActive("highlight")}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                    <Highlighter size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Code inline"
                    active={editor.isActive("code")}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    <Code size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Aligner à gauche"
                    active={editor.isActive({textAlign: "left"})}
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                    <AlignLeft size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Centrer"
                    active={editor.isActive({textAlign: "center"})}
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                    <AlignCenter size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Aligner à droite"
                    active={editor.isActive({textAlign: "right"})}
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                    <AlignRight size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Liste à puces"
                    active={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Liste numérotée"
                    active={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Citation"
                    active={editor.isActive("blockquote")}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Lien"
                    active={editor.isActive("link")}
                    onClick={handleSetLink}
                >
                    <Link2 size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Séparateur horizontal"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                    <Minus size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Effacer la mise en forme"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                >
                    <RemoveFormatting size={14}/>
                </ToolBtn>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <EditorContent editor={editor}/>
            </div>

            {maxChars && chars !== null && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-base-300 shrink-0">
                    <span className={`text-xs ${charColor}`}>{chars} / {maxChars} caractères</span>
                    <div className="w-24 h-1 bg-base-300 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${charPercent > 90 ? "bg-error" : charPercent > 70 ? "bg-warning" : "bg-success"}`}
                            style={{width: `${Math.min(charPercent, 100)}%`}}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}