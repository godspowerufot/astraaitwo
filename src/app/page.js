'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function VeniceAIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false); // Toggle state

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  // Function to add messages
  const addMessage = (content, role = 'user') => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  // Function to get chat response
  const getResponse = async (prompt) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [...messages, { role: 'user', content: prompt }],
        }),
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      return 'Error: Unable to fetch response.';
    }
  };

  // Function to generate an image using OpenAI
  const generateImage = async (prompt) => {
    try {
      setIsLoading(true);
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.data && data.data.length > 0) {
        addMessage(`Generated Image: ${data.data[0].url}`, 'assistant');
      } else {
        addMessage('Failed to generate image.', 'assistant');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('Error generating image.', 'assistant');
      setIsLoading(false);
    }
  };

  // Handle sending message or generating image
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    addMessage(userMessage);
    setInput('');

    if (isImageMode) {
      // If in image mode, generate an image
      await generateImage(userMessage);
    } else {
      // If in chat mode, get text response
      setIsLoading(true);
      const botResponse = await getResponse(userMessage);
      addMessage(botResponse, 'assistant');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#170525] text-white flex flex-col items-center">
  <header className="w-full bg-[rgba(122, 23, 120, 0.1)] p-4 text-center text-2xl font-bold uppercase tracking-widest border-b border-[#990099]">
    Timeless GPT
  </header>

  <div className=" relative flex flex-col mt-4 w-full max-w-2xl h-[90vh] lg:h-[500px] bg-[#7a17782f] rounded-lg shadow-lg overflow-hidden">
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`w-fit max-w-[75%] p-3 rounded-lg text-sm shadow-md ${
            message.role === 'assistant'
              ? 'bg-[#7a1778b2] border border-[#7A1778] self-start'
              : 'bg-[#7a1778b2] border border-[#990099] self-end'
          }`}
        >
          {message.content}
        </div>
      ))}
    </div>
    <button
        onClick={() => setIsImageMode(!isImageMode)}
        className="bg-[#7a1778b2]  hover:bg-[#7A1778] text-white px-4 py-2 "
      >
        {isImageMode ? 'Switch to Chat' : 'Switch to Image Mode'}
      </button>
    <div className="p-3 w-full  bg-[#7a177854] border-t border-[#990099] flex items-center justify-between">
   

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isImageMode ? 'Enter an image prompt...' : 'Type your message...'}
        className="flex-1 p-2 bg-[#170525] text-white rounded-lg outline-none placeholder-gray-400 mx-2"
      />

<button
  onClick={handleSend}
  className="bg-[#990099] hover:bg-[#7A1778] text-white font-medium p-2 rounded-lg transition duration-300"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 10l9-7 9 7M12 3v18"
    />
  </svg>
</button>

    </div>
  </div>
</div>
  );
}
