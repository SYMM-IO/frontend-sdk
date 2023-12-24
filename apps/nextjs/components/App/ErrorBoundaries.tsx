import React, { useEffect } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  useEffect(() => {
    const handleRuntimeError = (event: Event | string) => {
      console.log("Runtime error occurred:", event);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      //check for specific errors
      if (
        error.name === "TransactionNotFoundError" ||
        error.name === "BlockNotFoundError"
      ) {
        console.log("TransactionNotFound or BlockNotFound error:", error);
        event.preventDefault();
        event.stopPropagation();
      } else {
        // Handle other types of promise rejections (e.g., log the error)
        console.log("Unhandled promise rejection:", error);
        event.preventDefault();
        event.stopPropagation();
      }

      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.onerror = handleRuntimeError;

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.onerror = null;
    };
  }, []);

  return <>{children}</>;
};

export default ErrorBoundary;
