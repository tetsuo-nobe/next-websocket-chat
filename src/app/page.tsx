"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  id: number;
  text: string;
  isUser: boolean;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const currentResponseRef = useRef<string>("");
  const currentMessageIdRef = useRef<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://7oogqsakr4.execute-api.ap-northeast-1.amazonaws.com/dev");
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const messageText = String(data);
      
      currentResponseRef.current += messageText;
      
      if (currentMessageIdRef.current) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === currentMessageIdRef.current 
              ? { ...msg, text: currentResponseRef.current }
              : msg
          )
        );
      }
    };

    return () => ws.close();
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || !isConnected) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const messageId = Date.now() + 1;
    const systemMessage: Message = {
      id: messageId,
      text: "",
      isUser: false,
    };
    
    setMessages(prev => [...prev, systemMessage]);
    currentMessageIdRef.current = messageId;
    currentResponseRef.current = "";
    
    wsRef.current.send(JSON.stringify({
      action: "sendtext",
      text: input
    }));
    
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Next WebSocket Chat</h1>
          <div className={`px-2 py-1 rounded text-sm ${
            isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {isConnected ? "接続中" : "未接続"}
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-lg break-words ${
                message.isUser
                  ? "bg-yellow-200 text-black"
                  : "bg-green-200 text-black"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
