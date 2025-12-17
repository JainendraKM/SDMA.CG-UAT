import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-100 to-white shadow-md p-4 flex items-center border-b border-blue-200">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 overflow-hidden">
           <img 
            src="images/cglogo.png" 
            alt="CGSDMA Logo" 
            className="w-full h-full object-contain"
           />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-900 font-serif leading-tight">राजस्‍व एवं आपदा प्रबंधन विभाग</h1>
          <h2 className="text-lg font-medium text-blue-700">( छ.ग. राज्‍य आपदा प्रबंधन प्राधिकरण )</h2>
        </div>
      </div>
    </header>
  );
};