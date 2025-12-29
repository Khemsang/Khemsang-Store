import React from 'react';

const ResponsiveTest = () => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-bold mb-2">Screen Size Test</h3>
      
      {/* Mobile */}
      <div className="block sm:hidden text-xs text-red-600 font-bold">
        📱 Mobile (< 640px)
      </div>
      
      {/* Tablet */}
      <div className="hidden sm:block md:hidden text-xs text-blue-600 font-bold">
        📱 Small Tablet (640px - 768px)
      </div>
      
      {/* Medium Tablet */}
      <div className="hidden md:block lg:hidden text-xs text-green-600 font-bold">
        📱 Tablet (768px - 1024px)
      </div>
      
      {/* Desktop */}
      <div className="hidden lg:block xl:hidden text-xs text-purple-600 font-bold">
        🖥️ Desktop (1024px - 1280px)
      </div>
      
      {/* Large Desktop */}
      <div className="hidden xl:block 2xl:hidden text-xs text-orange-600 font-bold">
        🖥️ Large Desktop (1280px - 1536px)
      </div>
      
      {/* Ultra Wide */}
      <div className="hidden 2xl:block text-xs text-pink-600 font-bold">
        🖥️ Ultra Wide (> 1536px)
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Current breakpoint ind