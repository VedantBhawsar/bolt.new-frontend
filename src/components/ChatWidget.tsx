import { useState, useRef, useEffect } from "react";
import { Loader2, Plane } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "How can I help you today?", sender: "bot" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    // Add user message
    const newMessage: Message = {
      id: Date.now(),
      text: trimmedMessage,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate API call
    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const botResponse: Message = {
        id: Date.now(),
        text: "Thanks for your message!",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-blue rounded-lg h-full shadow-lg border border-gray-700">
      <div className="flex flex-col h-full">
        {/* Messages Container */}
        <div className="flex w-full h-14 border-b justify-start px-5 items-center border-gray-700">
          <h1 className="font-semibold text-xl">Chat</h1>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div>
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className={`flex-1 border border-gray-700 ${
                shake ? "animate-shake" : ""
              }`}
              disabled={isLoading}
            />
            <Button
              size={"icon"}
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 text-blue-500 hover:bg-gray-50/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plane className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
