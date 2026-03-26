import React from "react";

function ErrorBox({ children }: { children?: React.ReactNode }) {
  if (!children) {
    return;
  }
  return (
    <p className="-top-6 right-3 absolute bg-red-600 px-3 py-1.5 rounded-lg text-white text-xs">
      {children}
    </p>
  );
}

export default ErrorBox;
