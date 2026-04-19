"use client";

import React, { useEffect, useState } from 'react';

interface LabPartnerProps {
  message: string | null;
}

const LabPartner: React.FC<LabPartnerProps> = ({ message }) => {
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000); // Disappear after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!displayMessage) return null;

  return (
    <div className={`fixed bottom-24 right-4 z-50 max-w-[250px] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90 pointer-events-none'}`}>
      <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border-2 border-cyan-500 dark:border-cyan-400">
        {/* Pointer/Arrow */}
        <div className="absolute bottom-[-10px] right-6 w-5 h-5 bg-white dark:bg-gray-800 border-r-2 border-b-2 border-cyan-500 dark:border-cyan-400 rotate-45"></div>
        
        <div className="flex items-start gap-3">
          <div className="bg-cyan-100 dark:bg-cyan-900/50 p-2 rounded-full ring-2 ring-cyan-500 shrink-0">
             <span className="text-xl">🤖</span>
          </div>
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 mb-1">Lab Partner</h5>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-tight font-medium italic">
              "{displayMessage}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPartner;
