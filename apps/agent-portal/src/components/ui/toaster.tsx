'use client';

import React from 'react';

// Simple toast implementation - in production would use a library like sonner or react-hot-toast
export function Toaster() {
  return <div id="toast-container" className="fixed bottom-4 right-4 z-50" />;
}

export function toast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastElement = document.createElement('div');
  toastElement.className = `mb-2 p-4 rounded-lg shadow-lg ${
    type === 'success'
      ? 'bg-green-500 text-white'
      : type === 'error'
      ? 'bg-red-500 text-white'
      : 'bg-blue-500 text-white'
  } animate-in slide-in-from-right`;
  toastElement.textContent = message;

  container.appendChild(toastElement);

  setTimeout(() => {
    toastElement.remove();
  }, 3000);
}
