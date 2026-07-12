// toast.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const div = document.createElement('div');
    div.className = `
      fixed top-4 left-1/2 -translate-x-1/2
      px-4 py-2 rounded-lg shadow-lg
      text-white text-sm
      z-50
      ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
    `;
    div.innerText = message;

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 3000);
  }
}
