"use client";

import Loader from "@/components/ui/Loader";
import useFetch from "@/hooks/useFetch";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const UserContext = createContext({ isLoading: true, user: null, setUser: () => { }, refetch: () => { } });

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter();

const { refetch } = useFetch({
  auto: true,
  url: `/api/user`,
  withAuth: true,
  onSuccess: (result) => {
    setUser(result); // result is now just the user object
    setIsLoading(false);
  },
  onError: (err) => {
    toast.error("Error Fetching User");
    setIsLoading(false);
    router.push("/login");
  },
});




  if (isLoading) return <Loader fullScreen/>

  return (
    <UserContext.Provider value={{ user, setUser, refetch, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);