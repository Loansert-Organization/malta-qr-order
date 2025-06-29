import React from 'react';

const TypingDots = () => (
  <div className="flex gap-1">
    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.2s]"></span>
    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.1s]"></span>
    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
  </div>
);
export default TypingDots; 