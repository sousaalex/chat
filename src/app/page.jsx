// pages/Client.jsx
'use client'

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area"
import { marked } from 'marked';
const TypingAnimation = ({ text }) => {
  const [content, setContent] = useState('');
  const chatEndRef = useRef(null);


  useEffect(() => {
    // Se você precisa realizar alguma ação quando o `text` mudar,
    // mas sem a lógica de animação de texto, você pode colocar aqui.
    // Por exemplo, apenas atualizar o conteúdo com o texto completo.

    setContent(text);

    // Garantir que o elemento de referência seja rolado para a visualização.
    window.requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Ajuste o comportamento de rolagem conforme necessário
    });

  }, [text]);

  return (
    <>
      <p className=" rounded-xl text-base  font-normal" dangerouslySetInnerHTML={{ __html: marked(content) }} />
      <div ref={chatEndRef} />
    </>
  );
};

export default function ChatComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket("wss://chat-wss-wispy-frost-3467.fly.dev/");

    socketRef.current.onmessage = (event) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "other", text: event.data },
      ]);
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() !== "") {
      socketRef.current.send(inputValue);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "you", text: inputValue },
      ]);
      setInputValue("");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
    <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
      Abrir Chat
    </button>
  
    {isOpen && (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md bg-white rounded-t-2xl shadow-lg flex flex-col h-[90vh] ">
          <div className="flex-1 flex flex-col h-[80vh]">
            <ScrollArea className="flex-1 p-4 space-y-4 bg-gray-50 h-[100px]">
  {/*             {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-2 mt-6${message.sender === "you" ? "justify-end" : ""}`}>
                  <div className={`px-4 py-3 rounded-lg mt-6 ${message.sender === "you" ? "bg-cyan-500 text-white" : "bg-green-500 text-gray-700"}`}>
                    <p>
                      <TypingAnimation text={message.text}/>
                    </p>
                  </div>
                </div>
              ))} */}
              {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-2 mt-6 ${message.sender === "you" ? "justify-end" : ""}`}>
                <div className={`px-4 py-3 rounded-lg ${message.sender === "you" ? "bg-cyan-500 text-white" : "bg-green-500 text-gray-700"}`}>
                  <p>
                    <TypingAnimation text={message.text} />
                  </p>
                </div>
              </div>
            ))}
            </ScrollArea>
            <div className="border-t border-gray-300 p-2 flex items-center gap-2 bg-white">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2"
              />
              <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
                Enviar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
  </div>
  
  );
}