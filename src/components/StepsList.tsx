import React from 'react';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import type { Step } from '../types';

interface StepsListProps {
  steps: Step[];
}

const StepsList: React.FC<StepsListProps> = ({ steps }) => {
  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="h-full bg-gray-900 border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Build Progress</h2>
      </div>
      <div className="relative">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative ${index !== steps.length - 1 ? 'pb-8' : ''}`}
          >
            <div className="group relative flex items-start px-6 py-3 hover:bg-gray-800/50">
              <div className="flex items-center">
                <span className="flex h-9 items-center">
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center">
                    {getStatusIcon(step.status)}
                  </span>
                </span>
                {index !== steps.length - 1 && (
                  <div className="absolute left-[1.3rem] top-8 h-full w-px bg-gray-700" />
                )}
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <div className="flex items-center text-sm font-medium">
                  <span className={`
                    ${step.status === 'completed' ? 'text-green-400' : ''}
                    ${step.status === 'in-progress' ? 'text-blue-400' : ''}
                    ${step.status === 'pending' ? 'text-gray-400' : ''}
                  `}>
                    {step.title}
                  </span>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsList;