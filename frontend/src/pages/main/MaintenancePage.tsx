import React from 'react';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ 
  message = "We're currently performing scheduled maintenance to improve your experience." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
        
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Wrench className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-900" />
            </div>
          </div>
        </div>

        
        <h1 className="text-3xl font-bold text-white mb-4">
          Under Maintenance
        </h1>

        
        <p className="text-white/80 text-lg mb-6 leading-relaxed">
          {message}
        </p>

        
        <div className="flex items-center justify-center space-x-2 text-white/70 mb-8">
          <Clock className="w-5 h-5" />
          <span className="text-sm">We'll be back shortly</span>
        </div>

        
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/60 text-sm">
            Thank you for your patience
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;