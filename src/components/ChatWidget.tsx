import { useState, useRef, useEffect } from "react";
import { Loader2, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import axios from "axios";
import { apiUrl } from "@/config";
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export function ChatWidget({
  prompt,
  handleMessageSend,
}: {
  prompt: string;
  handleMessageSend: (inputMessage: string) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "user",
      text: prompt,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); 
    const message: string = event.target[0].value;
    if (!message) {
      return;
    }
    try {
      handleMessageSend(message.trim());
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          text: message,
          sender: "user",
        },
      ]);
    } catch (error) {
      console.log(error.message);
    }

    setInputMessage("");
  }

  return (
    <div className="bg-blue  h-96 min-h-40 shadow-lg border border-gray-700">
      <div className="flex flex-col h-full">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index}>
              <div
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3  text-sm ${
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
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-0">
            <div className="border-t border-gray-700 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className={`flex-1 border border-gray-700`}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
