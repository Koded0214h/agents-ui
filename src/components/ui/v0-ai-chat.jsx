import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Layout,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
} from "lucide-react";

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;

            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function VercelV0Chat() {
    const [value, setValue] = useState("");
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                setValue("");
                adjustHeight(true);
            }
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-12">
            <h1 className="text-6xl font-extrabold tracking-tight text-white drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                Agentic Solutions
            </h1>

            <div className="w-full">
                <div className="relative bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="overflow-y-auto pt-2">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask v0 a question..."
                            className={cn(
                                "w-full px-4 py-3",
                                "resize-none",
                                "bg-transparent",
                                "border-none outline-none ring-0",
                                "text-white text-base",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-neutral-500 placeholder:text-sm",
                                "min-h-[60px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 border-t border-neutral-800">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-white" />
                                <span className="text-xs text-zinc-400 hidden group-hover:inline transition-opacity duration-200">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1.5"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                Project
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    "px-2 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center",
                                    value.trim()
                                        ? "bg-white text-black hover:bg-zinc-200"
                                        : "text-zinc-500 bg-neutral-800 cursor-not-allowed"
                                )}
                                disabled={!value.trim()}
                            >
                                <ArrowUpIcon
                                    className="w-4 h-4"
                                />
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
                    <ActionButton icon={<ImageIcon className="w-4 h-4" />} label="Clone a Screenshot" />
                    <ActionButton icon={<Layout className="w-4 h-4" />} label="Import from Figma" />
                    <ActionButton icon={<FileUp className="w-4 h-4" />} label="Upload a Project" />
                    <ActionButton icon={<MonitorIcon className="w-4 h-4" />} label="Landing Page" />
                    <ActionButton icon={<CircleUserRound className="w-4 h-4" />} label="Sign Up Form" />
                </div>
            </div>
        </div>
    );
}

function ActionButton({ icon, label }) {
    return (
        <button
            type="button"
            className="flex items-center gap-2.5 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-all duration-200 shadow-sm"
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}
