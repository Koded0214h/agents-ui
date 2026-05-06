import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "./Textarea";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    ImageIcon,
    FileUp,
    Layout,
    MonitorIcon,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    Bot,
    User,
    Loader2
} from "lucide-react";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// n8n Webhook URL
const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || "";

const sendLogToN8n = async (logData: any) => {
    if (!N8N_WEBHOOK_URL) return;
    try {
        // We use a "simple request" (no Content-Type header) to avoid CORS preflight (OPTIONS)
        // n8n will still receive the JSON body and can usually parse it automatically.
        await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: JSON.stringify(logData),
        });
    } catch (error) {
        console.error("n8n Logging Error:", error);
    }
};

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
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
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 52,
        maxHeight: 200,
    });

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = async () => {
        if (!value.trim() || isLoading) return;

        const userText = value.trim();
        const userMessage = { role: "user", content: userText };
        setMessages((prev) => [...prev, userMessage]);
        setValue("");
        adjustHeight(true);
        setIsLoading(true);

        try {
            const chat = model.startChat({
                history: messages.map(m => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.content }],
                })),
            });

            const result = await chat.sendMessage(userText);
            const response = await result.response;
            const text = response.text();

            const assistantMessage = { role: "assistant", content: text };
            setMessages((prev) => [...prev, assistantMessage]);

            // Log to n8n
            sendLogToN8n({
                timestamp: new Date().toISOString(),
                userMessage: userText,
                aiResponse: text,
                status: 'success'
            });

        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMessage = "Error: Failed to get response from Gemini. Please check your API key.";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: errorMessage }
            ]);

            // Log error to n8n
            sendLogToN8n({
                timestamp: new Date().toISOString(),
                userMessage: userText,
                aiResponse: errorMessage,
                status: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 sm:px-6 h-[88vh] sm:h-[85vh]">
            <div
                ref={scrollRef}
                className="flex-1 w-full overflow-y-auto mb-4 sm:mb-8 space-y-4 sm:space-y-6 scrollbar-hide pr-1 sm:pr-2"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-8 sm:space-y-12 mt-[-10vh]">
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 text-center leading-tight">
                            Agentic Solutions
                        </h1>
                        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-2xl px-4">
                            <ActionButton icon={<ImageIcon className="w-3.5 h-3.5 sm:w-4 h-4" />} label="Clone Screen" />
                            <ActionButton icon={<Layout className="w-3.5 h-3.5 sm:w-4 h-4" />} label="Figma Import" />
                            <ActionButton icon={<FileUp className="w-3.5 h-3.5 sm:w-4 h-4" />} label="Upload Project" />
                            <ActionButton icon={<MonitorIcon className="w-3.5 h-3.5 sm:w-4 h-4" />} label="Landing Page" />
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "flex items-start gap-2 sm:gap-4",
                                msg.role === "user" ? "justify-end flex-row-reverse" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 sm:p-2 rounded-full flex-shrink-0",
                                msg.role === "assistant" ? "bg-purple-600/20 border border-purple-500/30" : "bg-white/10 border border-white/20"
                            )}>
                                {msg.role === "assistant" ? (
                                    <Bot className="w-4 h-4 sm:w-5 h-5 text-purple-400" />
                                ) : (
                                    <User className="w-4 h-4 sm:w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className={cn(
                                "max-w-[90%] sm:max-w-[85%] rounded-xl sm:rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3.5 shadow-lg prose prose-invert prose-sm break-words",
                                msg.role === "user"
                                    ? "bg-purple-600 text-white rounded-tr-none"
                                    : "bg-white/5 border border-white/10 text-zinc-200 backdrop-blur-md rounded-tl-none"
                            )}>
                                <ReactMarkdown>
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex items-start gap-2 sm:gap-4 animate-pulse">
                        <div className="p-1.5 sm:p-2 rounded-full bg-purple-600/20 border border-purple-500/30">
                            <Bot className="w-4 h-4 sm:w-5 h-5 text-purple-400" />
                        </div>
                        <div className="bg-white/5 border border-white/10 text-zinc-200 backdrop-blur-md rounded-xl sm:rounded-2xl rounded-tl-none px-4 py-2.5 sm:px-5 sm:py-3.5">
                            <div className="flex gap-1.5 items-center h-5">
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full relative z-20 pb-4 sm:pb-0">
                <div className="relative bg-black/60 backdrop-blur-3xl rounded-xl sm:rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/20">
                    <div className="overflow-y-auto">
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                adjustHeight();
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Agentic Solutions (CRA)..."
                            className={cn(
                                "w-full px-4 py-3 sm:px-4 sm:py-4",
                                "resize-none",
                                "bg-transparent",
                                "border-none outline-none ring-0",
                                "text-white text-[15px] sm:text-base",
                                "focus:outline-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0",
                                "placeholder:text-zinc-500 placeholder:text-sm shadow-none",
                                "min-h-[52px]"
                            )}
                            style={{
                                overflow: "hidden",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between px-3 py-2 sm:p-3 border-t border-white/5">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                type="button"
                                className="group p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <Paperclip className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:group-hover:inline transition-opacity duration-200">
                                    Attach
                                </span>
                            </button>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                type="button"
                                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm text-zinc-400 transition-colors border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-white/5 flex items-center justify-between gap-1 sm:gap-1.5"
                            >
                                <PlusIcon className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Project</span>
                            </button>
                            <button
                                onClick={handleSend}
                                type="button"
                                className={cn(
                                    "p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg",
                                    value.trim() && !isLoading
                                        ? "bg-white text-black hover:bg-zinc-200 scale-105"
                                        : "text-zinc-500 bg-white/5 cursor-not-allowed"
                                )}
                                disabled={!value.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowUpIcon className="w-4 h-4" />
                                )}
                                <span className="sr-only">Send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-[10px] text-center text-zinc-600 mt-2 hidden sm:block">
                    Agentic Solutions can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button
            type="button"
            className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-5 sm:py-2.5 bg-black/40 hover:bg-white/5 rounded-full border border-white/10 text-zinc-400 hover:text-white transition-all duration-200 shadow-sm backdrop-blur-md"
        >
            {icon}
            <span className="text-[10px] sm:text-xs font-medium">{label}</span>
        </button>
    );
}
