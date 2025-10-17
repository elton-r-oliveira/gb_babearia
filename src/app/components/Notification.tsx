"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface NotificationProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function Notification({ 
  message, 
  type = "success", 
  onClose, 
  duration = 5000 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-green-600";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="w-6 h-6" />;
      case "error":
        return <XMarkIcon className="w-6 h-6" />;
      case "info":
        return <CheckCircleIcon className="w-6 h-6" />;
      default:
        return <CheckCircleIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 transform transition-all duration-300
      ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
    `}>
      <div className={`
        ${getBackgroundColor()} text-white rounded-lg shadow-lg p-4 min-w-80
        border-l-4 ${type === "success" ? "border-green-400" : type === "error" ? "border-red-400" : "border-blue-400"}
      `}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <p className="font-semibold">
                {type === "success" ? "Sucesso!" : 
                 type === "error" ? "Erro!" : "Informação"}
              </p>
              <p className="text-sm opacity-90">{message}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}