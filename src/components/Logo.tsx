import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
        Resume Rocket Match AI
      </span>
      <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-md">
        ATS Optimizer
      </span>
    </div>
  );
};

export default Logo;