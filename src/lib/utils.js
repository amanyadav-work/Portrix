import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}



const SECRET = process.env.NEXT_PUBLIC_COOKIE_SECRET||'your-secret-key'; 

export const setToken = (token, userID, rememberMe = false) => {
  const options = {
    expires: rememberMe ? 30 : 1,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  };

  const encryptedID = CryptoJS.AES.encrypt(userID, SECRET).toString();

  Cookies.set('authToken', token, options);
  Cookies.set('user', encryptedID, options);
};

export const getUserID = () => {
  const encrypted = Cookies.get('user');
  if (!encrypted) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, process.env.NEXT_PUBLIC_COOKIE_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Error decrypting user ID:", err);
    return null;
  }
};




export const getToken = () => Cookies.get('authToken');

export const removeToken = () => {
  Cookies.remove('authToken');
  Cookies.remove('user');
};

export const logout = () => {
  removeToken();
  window.location.href = '/?login=true';
};
