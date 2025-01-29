'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function VeniceAIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  const addMessage = (content, role = 'user') => {
    setMessages((prev) => [...prev, { role, content }]);
  };

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

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const botResponse = await getResponse(userMessage);
    addMessage(botResponse, 'assistant');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center">
      <header className="w-full bg-black/70 p-4 text-center text-2xl font-bold uppercase tracking-widest border-b border-teal-500">
       Episenterai
      </header>
      <div className='w-full justify-end  mt-4 mr-4'>
        <ul className="flex gap-8  justify-center items-center "> {/* Add spacing between icons */}
          <li>
            <Link href="https://www.linkedin.com/in/john-dan-olofo-28882018b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" passHref>
<img src="/linkedin.png" alt="in" className="text-white-500n w-auto h-[20.5px]"   />            </Link>
          </li>
          <li>
            <Link href="https://x.com/olofojohn" passHref>
<img src="/x.png" alt="twitter" srcset=""  className="text-white-500 w-auto h-[20.5px]"  />            </Link>
          </li>
       

        </ul>
      </div>

      <div className="flex flex-col mt-4 w-full max-w-2xl h-screen lg:h-[500px] bg-gray-900/80 rounded-lg shadow-lg overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`w-fit max-w-[75%] p-3 rounded-lg text-sm shadow-md ${
                message.role === 'assistant'
                  ? 'bg-teal-700/30 border border-teal-500 self-start'
                  : 'bg-teal-500/70 border border-teal-700 self-end'
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="w-fit max-w-[75%] p-3 rounded-lg text-sm shadow-md bg-gray-600 border border-gray-500 self-start animate-pulse">
              Typing...
            </div>
          )}
        </div>

        <div className="p-3  bg-black/70 border-t border-teal-500 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 bg-gray-800 text-white rounded-lg outline-none placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            className="bg-teal-500 hover:bg-teal-600 text-black font-medium py-2 px-4 rounded-lg transition duration-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
