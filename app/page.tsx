"use client";

import { useRef, useState } from "react";
import { useChat } from "ai/react";
import va from "@vercel/analytics";
import clsx from "clsx";
import { VercelIcon, GithubIcon, LoadingCircle, SendIcon } from "./icons";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Textarea from "react-textarea-autosize";
import { toast } from "sonner";

const examples = [
  "How do tax brackets work?",
  "Tell me about deductions.",
  "Give me an example tax calculation table.",
];

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    size: number;
  } | null>(null);

  const { messages, input, setInput, handleSubmit, isLoading, append } =
    useChat({
      onResponse: (response: Response) => {
        if (response.status === 429) {
          toast.error("You have reached your request limit for the day.");
          va.track("Rate limited");
          return;
        } else {
          va.track("Chat initiated");
        }
      },
      onError: (error: Error) => {
        va.track("Chat errored", {
          input,
          error: error.message,
        });
      },
    });

  const disabled = isLoading || input.length === 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile({
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Display file in chat
    append({
      content: `📄 File attached: ${file.name} (${formatFileSize(file.size)})`,
      role: "user",
    });

    // Clear the input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <main className="flex flex-col items-center justify-between pb-40">
      <div className="sticky top-5 hidden w-full justify-between px-5 xl:flex">
        <div className="flex space-x-4">
          <a
            href="/deploy"
            target="_blank"
            className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100"
          >
            <VercelIcon />
          </a>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-black p-2 text-white transition-colors duration-200 hover:bg-gray-800"
          >
            New Chat
          </button>
        </div>
        <a
          href="https://github.com/Yash-Aanand"
          target="_blank"
          className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100"
        >
          <GithubIcon />
        </a>
      </div>

      {messages.length > 0 ? (
        messages.map((message, i) => (
          <div
            key={i}
            className={clsx(
              "flex w-full flex-col items-center justify-center border-b border-gray-200 py-8",
              message.role === "user" ? "bg-white" : "bg-gray-100",
            )}
          >
            <div className="flex w-full max-w-screen-md items-start space-x-4 px-5 sm:px-0">
              <div
                className={clsx(
                  "p-1.5 text-white",
                  message.role === "assistant" ? "bg-green-500" : "bg-black",
                )}
              >
                {message.role === "user" ? (
                  <User width={20} />
                ) : (
                  <Bot width={20} />
                )}
              </div>
              <ReactMarkdown
                className="prose mt-1 w-full break-words prose-p:leading-relaxed"
                remarkPlugins={[remarkGfm]}
                components={{
                  a: (props) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {message.role === "assistant" && (
              <div className="my-2 flex w-full max-w-screen-md flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
                {examples.map((example, i) => (
                  <button
                    key={i}
                    className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                    onClick={() => {
                      setInput(example);
                      inputRef.current?.focus();
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        // Static Splash Screen befoier the first prompt
        <div className="border-gray-200sm:mx-0 mx-5 mt-20 max-w-screen-md rounded-md border sm:w-full">
          <div className="flex flex-col space-y-4 p-7 sm:p-10">
            <h1 className="text-center text-3xl font-bold font-semibold text-black">
              Welcome to Taxbot!
            </h1>
            <p className="text-gray-500">
              This is an AI chatbot that uses{" "}
              <a
                href="https://platform.openai.com/docs/guides/gpt/function-calling"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                OpenAI Functions
              </a>{" "}
              and{" "}
              <a
                href="https://sdk.vercel.ai/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4 transition-colors hover:text-black"
              >
                Vercel AI SDK
              </a>{" "}
              to help answer your tax-related queries.
            </p>
          </div>

          {/* Example prompts */}
          <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
            {examples.map((example, i) => (
              <button
                key={i}
                className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                onClick={() => {
                  setInput(example);
                  inputRef.current?.focus();
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 flex w-full flex-col items-center space-y-3 bg-gradient-to-b from-transparent via-gray-100 to-gray-100 p-5 pb-3 sm:px-0">
        {uploadedFile && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm">
            <span className="text-gray-700">
              📄 {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative w-full max-w-screen-md rounded-xl border border-gray-200 bg-white px-4 pb-2 pt-3 shadow-lg sm:pb-3 sm:pt-4"
        >
          <Textarea
            ref={inputRef}
            tabIndex={0}
            required
            rows={1}
            autoFocus
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                formRef.current?.requestSubmit();
                e.preventDefault();
              }
            }}
            spellCheck={false}
            className="w-full pr-20 focus:outline-none"
          />
          <div className="absolute inset-y-0 right-3 flex gap-1">
            <button
              type="button"
              className="my-auto flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-gray-100"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
            </button>
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
            />
            <button
              className={clsx(
                "my-auto flex h-8 w-8 items-center justify-center rounded-md transition-all",
                disabled
                  ? "cursor-not-allowed bg-white"
                  : "bg-green-500 hover:bg-green-600",
              )}
              disabled={disabled}
            >
              {isLoading ? (
                <LoadingCircle />
              ) : (
                <SendIcon
                  className={clsx(
                    "h-4 w-4",
                    input.length === 0 ? "text-gray-300" : "text-white",
                  )}
                />
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-400">
          Built with{" "}
          <a
            href="https://platform.openai.com/docs/guides/gpt/function-calling"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            OpenAI Functions
          </a>{" "}
          and{" "}
          <a
            href="https://sdk.vercel.ai/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black"
          >
            Vercel AI SDK
          </a>
          .
        </p>
      </div>
    </main>
  );
}
