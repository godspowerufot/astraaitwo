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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center">
      <header className="w-full bg-black/70 p-4 text-center text-2xl font-bold uppercase tracking-widest border-b border-teal-500">
        Episenterai
      </header>

      <div className="w-full justify-end mt-4 mr-4">
        <ul className="flex gap-8 justify-center items-center">
          <li>
            <Link href="https://www.linkedin.com/in/john-dan-olofo-28882018b">
              <img src="/linkedin.png" alt="LinkedIn" className="w-auto h-[20.5px]" />
            </Link>
          </li>
          <li>
            <Link href="https://x.com/olofojohn">
              <img src="/x.png" alt="Twitter" className="w-auto h-[20.5px]" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Chat Box */}
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
              {message.content.startsWith('Generated Image: ') ? (
                <img src={message.content.replace('Generated Image: ', '')} alt="Generated" className="rounded-lg w-64 h-64 object-cover" />
              ) : (
                message.content
              )}
            </div>
          ))}

          {isLoading && (
            <div className="w-fit max-w-[75%] p-3 rounded-lg text-sm shadow-md bg-gray-600 border border-gray-500 self-start animate-pulse">
              Typing...
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div className="p-3 bg-black/70 border-t border-teal-500 flex items-center justify-between">
          <button
            onClick={() => setIsImageMode(!isImageMode)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            {isImageMode ? 'Switch to Chat' : 'Switch to Image Mode'}
          </button>

          {/* Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isImageMode ? 'Enter an image prompt...' : 'Type your message...'}
            className="flex-1 p-2 bg-gray-800 text-white rounded-lg outline-none placeholder-gray-400 mx-2"
          />

          {/* Send Button */}
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
