import React, { useEffect, useRef } from 'react';

interface RenderDebuggerProps {
  componentName: string;
  dependencies?: any[];
}

const RenderDebugger: React.FC<RenderDebuggerProps> = ({ componentName, dependencies = [] }) => {
  const renderCount = useRef(0);
  const lastDeps = useRef<any[]>([]);

  useEffect(() => {
    renderCount.current += 1;
    
    const depsChanged = JSON.stringify(dependencies) !== JSON.stringify(lastDeps.current);
    
    console.log(`🔍 [${componentName}] Render #${renderCount.current}`, {
      depsChanged,
      dependencies: dependencies.length > 0 ? dependencies : 'none',
      timestamp: new Date().toISOString()
    });
    
    lastDeps.current = [...dependencies];
  });

  return null;
};

export default RenderDebugger;
