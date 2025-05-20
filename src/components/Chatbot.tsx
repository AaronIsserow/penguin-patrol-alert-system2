// Chatbot: Interactive assistant for penguin and wildlife questions
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MAX_MESSAGES = 10;

// Message type for chat history
interface Message {
  sender: "user" | "bot";
  text: string;
}

// Fun prompts for initial bot message
const funPrompts = [
  "Ask me about penguin safety! 🐧",
  "Curious about honey badgers? Just ask! 🦡",
  "Try: How do penguins stay safe from predators?",
  "Try: What makes honey badgers so tough?",
  "Try: 'How can we protect penguin colonies?'"
];

// Allowed keywords for relevant questions
const ALLOWED_KEYWORDS = [
  "penguin",
  "penguins",
  "honey badger",
  "honeybadger",
  "honeybadgers",
  "honey badgers",
  "wildlife",
  "colony",
  "predator",
  "deterrent",
  "safety",
  "animal",
  "conservation"
];

// Check if question is relevant
const isRelevantQuestion = (text: string) => {
  const lower = text.toLowerCase();
  return ALLOWED_KEYWORDS.some(keyword => lower.includes(keyword));
};

// Main chatbot component
const Chatbot: React.FC = () => {
  // State for chat messages, input, loading, errors, and message count
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: funPrompts[Math.floor(Math.random() * funPrompts.length)] }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handle sending a message
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || messageCount >= MAX_MESSAGES) return;
    setError(null);
    const userMessage = input.trim();
    if (!isRelevantQuestion(userMessage)) {
      setError("Please ask a question about penguins, honey badgers, or wildlife safety!");
      return;
    }
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);
    setMessageCount((c) => c + 1);

    try {
      // Call OpenAI API for chatbot response
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a friendly expert on penguins, honey badgers, and wildlife safety. Only answer questions about these topics. If a question is unrelated, politely refuse and ask the user to stay on topic." },
            ...messages.filter(m => m.sender === "user").map(m => ({ role: "user", content: m.text })),
            { role: "user", content: userMessage }
          ],
          max_tokens: 80,
        }),
      });
      const data = await response.json();
      if (data.choices && data.choices[0]?.message?.content) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.choices[0].message.content.trim() }]);
      } else {
        setError("Sorry, I couldn't get an answer. Try again!");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <Card className="w-full max-w-xs min-h-[500px] flex flex-col shadow-lg border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
          🐧 Penguin Patrol Chatbot
        </CardTitle>
        <div className="text-xs text-blue-700 mt-1">
          Ask me anything about penguins, honey badgers, or wildlife safety!<br />
          (Max {MAX_MESSAGES} questions per session)
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 bg-white rounded-md p-2" style={{ maxHeight: 320 }}>
        {/* Render chat messages */}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${msg.sender === "user" ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2 bg-blue-100 text-blue-800 flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" /> Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {error && <div className="text-xs text-red-500 mb-1">{error}</div>}
        {/* Input form for user questions */}
        <form onSubmit={sendMessage} className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading || messageCount >= MAX_MESSAGES}
            className="flex-1"
            maxLength={200}
            autoComplete="off"
          />
          <Button type="submit" disabled={loading || !input.trim() || messageCount >= MAX_MESSAGES}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {messageCount >= MAX_MESSAGES && (
          <div className="text-xs text-blue-700 text-center">You've reached the chat limit for this session. Refresh to start over!</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default Chatbot; 