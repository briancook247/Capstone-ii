import React from "react";

export default function ChatMessages() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* System Message */}
      <div className="flex items-start space-x-4 bg-muted/30 rounded-lg p-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold">S</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            I’ve analyzed the API documentation. Ask me anything about the API’s endpoints, authentication, or usage examples.
          </p>
        </div>
      </div>
      {/* Additional messages can be rendered here */}
    </div>
  );
}