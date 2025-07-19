import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



export async function logout() {
  const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  if (res.ok) {
    // Optionally redirect to login page or clear user context state here
    window.location.href = '/login';
  } else {
    console.error('Failed to logout');
  }
}