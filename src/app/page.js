'use client';

import { useEffect, useState } from 'react';

export default function VeniceAIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [isGhibliMode, setIsGhibliMode] = useState(false);
  const [file, setFile] = useState(null);
  const [ghibliImageUrl, setGhibliImageUrl] = useState('');
const [tokensWithPrices, setTokensWithPrices] = useState([]);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

 useEffect(() => {
  const fetchJupiterTokensAndPrices = async () => {
    try {
      const tokenRes = await fetch('https://tokens.jup.ag/tokens?tags=verified');
      const tokens = await tokenRes.json();
      const first10 = tokens.slice(0, 50); // You can change to 50

      const ids = first10.map((t) => t.address).join(',');
      const priceRes = await fetch(`https://lite-api.jup.ag/price/v2?ids=${ids}`);
      const prices = await priceRes.json();


      const merged = first10.map((token,index) => ({
        symbol: token.symbol,
        name: token.name,
        logoURI: token.logoURI,
       price: prices.data[token.address]?.price ?? 'N/A',// use ?? instead of || to preserve 0 prices
      }));
   setTokensWithPrices(merged);  // Save here!
      console.log('🪙 Merged token data:', merged);
    } catch (err) {
      console.error('❌ Error fetching tokens or prices:', err);
    }
  };

  fetchJupiterTokensAndPrices();
}, []);

  const addMessage = (content, role = 'user') => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const addSystemMessage = (content) => {
    setMessages((prev) => [...prev, { role: 'system', content }]);
  };

  const getResponse = async (prompt) => {
    try {
      const res = await fetch(API_URL, {
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
      const data = await res.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error:', error);
      return 'Error: Unable to fetch response.';
    }
  };

  const generateImage = async (prompt) => {
    try {
      setIsLoading(true);
      const res = await fetch('https://api.openai.com/v1/images/generations', {
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
      const data = await res.json();
      setIsLoading(false);
      if (data.data && data.data.length > 0) {
        addMessage(data.data[0].url, 'image');
      } else {
        addMessage('Failed to generate image.', 'assistant');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      setIsLoading(false);
      addMessage('Error generating image.', 'assistant');
    }
  };

  const generateGhibliImage = async () => {
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('https://api.deepai.org/api/studio-ghibli', {
        method: 'POST',
        headers: {
          'Api-Key': 'e6d6e47f-0e78-4329-9c87-d04e888542f1',
        },
        body: formData,
      });
      const data = await res.json();
      setIsLoading(false);
      if (data?.output_url) {
        setGhibliImageUrl(data.output_url);
        addMessage('Ghibli-style image generated!', 'assistant');
        addMessage(data.output_url, 'image');
      } else {
        addMessage('Failed to generate Ghibli-style image.', 'assistant');
      }
    } catch (error) {
      console.error('Ghibli generation error:', error);
      setIsLoading(false);
      addMessage('Error generating Ghibli-style image.', 'assistant');
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    addMessage(input);
    setInput('');
    if (isImageMode) {
      await generateImage(input);
    } else if (!isGhibliMode) {
      setIsLoading(true);
      const botReply = await getResponse(input);
      addMessage(botReply, 'assistant');
      setIsLoading(false);  
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = ghibliImageUrl;
    a.download = 'ghibli-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSwitch = (mode) => {
    setIsImageMode(mode === 'image');
    setIsGhibliMode(mode === 'ghibli');
    if (mode === 'image') {
      addSystemMessage('Switched to Image Generation Mode.');
    } else if (mode === 'ghibli') {
      addSystemMessage('Switched to Ghibli Image Upload Mode.');
    } else {
      addSystemMessage('Switched to Text Chat Mode.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <header className="w-full flex justify-center items-center bg-gray-900 p-4 text-2xl font-bold uppercase tracking-widest border-b border-gray-700">
        ASTRA AI
      </header>
      <div className="w-full bg-gray-800 py-2 mb-4 overflow-hidden border border-gray-700 rounded">
        <div
          className="flex font-sans items-center gap-8 animate-marquee whitespace-nowrap"
          style={{ animationDuration: "60s" }}
        >
          {tokensWithPrices.length === 0 && <span>Loading tokens...</span>}
          {tokensWithPrices.map((token, idx) => (
            <div key={idx} className="flex gap-3 ml-4">
              <img
                src={token.logoURI}
                alt={token.symbol}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex  gap-1">
                <span>
                  {token.symbol} (${parseFloat(token.price).toFixed(3)})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 my-4">
           <button
          onClick={() => handleSwitch("ghibli")}
          className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
        >
          Ghibli Upload
        </button>
            <button
          onClick={() => handleSwitch("image")}
          className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
        >
          Image Mode
        </button>1
        <button
          onClick={() => handleSwitch("chat")}
          className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded"
        >
          Chat Mode
        </button>
    
     
      </div>

      {!isGhibliMode ? (
        <div className="relative flex flex-col w-full max-w-2xl h-[90vh] lg:h-[500px] bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`w-fit max-w-[75%] p-3 rounded-lg text-sm shadow-md ${
                  msg.role === "assistant" || msg.role === "image"
                    ? "bg-gray-800 border border-gray-700 self-start"
                    : msg.role === "system"
                    ? "bg-gray-700 border border-gray-500 text-sm italic self-center"
                    : "bg-gray-800 border border-gray-600 self-end"
                }`}
              >
                {msg.role === "image" ? (
                  <img
                    src={msg.content}
                    alt="Generated"
                    className="rounded-lg w-full h-auto"
                  />
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isLoading && (
              <div className="animate-bounce text-white text-center mt-2">
                Loading...
              </div>
            )}
          </div>
          <div className="p-3 w-full bg-gray-800 border-t border-gray-700 flex items-center justify-between">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isImageMode ? "Enter image prompt..." : "Type your message..."
              }
              className="flex-1 p-2 bg-black text-white rounded-lg outline-none placeholder-gray-400 mx-2"
            />
            <button
              onClick={handleSend}
              className="bg-gray-200 hover:bg-gray-300 text-black font-medium p-2 rounded-lg transition duration-300"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl mb-4 font-semibold">
            Upload Image for Ghibli Style
          </h2>
          <input type="file" onChange={handleFileChange} className="mb-2" />
          <button
            onClick={generateGhibliImage}
            className="block w-full bg-gray-200 text-black p-2 mb-4 hover:bg-gray-300"
          >
            Upload File
          </button>
          {isLoading && (
            <div className="animate-bounce text-white text-center">
              Generating Ghibli-style image...
            </div>
          )}
          {ghibliImageUrl && (
            <div className="mt-4 text-center space-y-4">
              <img
                src={ghibliImageUrl}
                alt="Ghibli-style"
                className="rounded-lg w-full h-auto"
              />
              <button
                onClick={handleDownload}
                className="inline-block bg-black text-white px-4 py-2 rounded-lg transition duration-300"
              >
                Download Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
