"use client";

import {useEffect} from "react";
import {useEditor, EditorContent, useEditorState} from "@tiptap/react";
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
    onCharsChange?: (chars: number) => void;
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

export default function TextEditor({content, onChange, maxChars, onCharsChange, placeholder = "Commencez à taper..."}: Props) {
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
            CharacterCount,
        ],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: [
                    "focus:outline-none min-h-[280px] prose prose-sm max-w-none text-base-content",
                    "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:leading-tight",
                    "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:leading-tight",
                    "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:leading-snug",
                    "[&_strong]:font-bold [&_em]:italic",
                    "[&_p]:mb-2 [&_p]:leading-relaxed",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2",
                    "[&_li]:mb-0.5 [&_li]:leading-relaxed",
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-base-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-base-content/60 [&_blockquote]:my-2",
                    "[&_code]:bg-base-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
                    "[&_a]:underline [&_a]:text-primary",
                ].join(" "),
            },
        },
        onUpdate: ({editor}) => {
            onChange(editor.getHTML());
            onCharsChange?.(editor.storage.characterCount?.characters() ?? 0);
        },
    });

    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            if (!ctx.editor) return null;
            return {
                isH1: ctx.editor.isActive("heading", {level: 1}),
                isH2: ctx.editor.isActive("heading", {level: 2}),
                isH3: ctx.editor.isActive("heading", {level: 3}),
                isBold: ctx.editor.isActive("bold"),
                isItalic: ctx.editor.isActive("italic"),
                isUnderline: ctx.editor.isActive("underline"),
                isStrike: ctx.editor.isActive("strike"),
                isHighlight: ctx.editor.isActive("highlight"),
                isCode: ctx.editor.isActive("code"),
                isAlignLeft: ctx.editor.isActive({textAlign: "left"}),
                isAlignCenter: ctx.editor.isActive({textAlign: "center"}),
                isAlignRight: ctx.editor.isActive({textAlign: "right"}),
                isBulletList: ctx.editor.isActive("bulletList"),
                isOrderedList: ctx.editor.isActive("orderedList"),
                isBlockquote: ctx.editor.isActive("blockquote"),
                isLink: ctx.editor.isActive("link"),
            };
        },
    });

    useEffect(() => {
        if (!editor) return;
        if (editor.getHTML() !== content) {
            editor.commands.setContent(content || "");
            onCharsChange?.(editor.storage.characterCount?.characters() ?? 0);
        }
    }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!editor) return null;

    const chars = editor.storage.characterCount?.characters() ?? 0;
    const charPercent = maxChars ? (chars / maxChars) * 100 : 0;
    const charColor = !maxChars
        ? "text-base-content/40"
        : charPercent > 100 ? "text-error"
            : charPercent > 90 ? "text-error"
                : charPercent > 70 ? "text-warning"
                    : "text-base-content/40";

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
                    active={editorState?.isH1 ?? false}
                    onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
                >
                    <span className="text-[11px] font-bold leading-none">H1</span>
                </ToolBtn>
                <ToolBtn
                    title="Titre H2"
                    active={editorState?.isH2 ?? false}
                    onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
                >
                    <Heading2 size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Titre H3"
                    active={editorState?.isH3 ?? false}
                    onClick={() => editor.chain().focus().toggleHeading({level: 3}).run()}
                >
                    <Heading3 size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Gras"
                    active={editorState?.isBold ?? false}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Italique"
                    active={editorState?.isItalic ?? false}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Souligné"
                    active={editorState?.isUnderline ?? false}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Barré"
                    active={editorState?.isStrike ?? false}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Surligner"
                    active={editorState?.isHighlight ?? false}
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                    <Highlighter size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Code inline"
                    active={editorState?.isCode ?? false}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    <Code size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Aligner à gauche"
                    active={editorState?.isAlignLeft ?? false}
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                >
                    <AlignLeft size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Centrer"
                    active={editorState?.isAlignCenter ?? false}
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                >
                    <AlignCenter size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Aligner à droite"
                    active={editorState?.isAlignRight ?? false}
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                >
                    <AlignRight size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Liste à puces"
                    active={editorState?.isBulletList ?? false}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Liste numérotée"
                    active={editorState?.isOrderedList ?? false}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={14}/>
                </ToolBtn>
                <ToolBtn
                    title="Citation"
                    active={editorState?.isBlockquote ?? false}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote size={14}/>
                </ToolBtn>

                <Divider/>

                <ToolBtn
                    title="Lien"
                    active={editorState?.isLink ?? false}
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

            {maxChars && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-base-300 shrink-0">
                    <span className={`text-xs ${charColor}`}>
                        {chars.toLocaleString("fr-FR")} / {maxChars.toLocaleString("fr-FR")} caractères
                        {charPercent > 100 && " — limite dépassée"}
                    </span>
                    <div className="w-24 h-1 bg-base-300 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${charPercent > 100 ? "bg-error" : charPercent > 70 ? "bg-warning" : "bg-success"}`}
                            style={{width: `${Math.min(charPercent, 100)}%`}}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}