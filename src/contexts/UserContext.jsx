"use client";

import Loader from "@/components/ui/Loader";
import useFetch from "@/hooks/useFetch";
import { getUserID } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const UserContext = createContext({ isLoading: true, user: null, setUser: () => { }, refetch: () => { } });

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true)

  const userID = getUserID();
  const router = useRouter();

const { refetch } = useFetch({
  auto: true,
  url: userID ? `/api/user/${userID}` : null,
  withAuth: true,
  onSuccess: (result) => {
    setUser(result); // result is now just the user object
    setIsLoading(false);
    console.log("User fetched:", result);
  },
  onError: (err) => {
    toast.error("Error Fetching User");
    setIsLoading(false);
    router.push("/login");
  },
});


  useEffect(() => {
    if (!userID) {
      setIsLoading(false)
    }
    console.log("User ID:", userID);
  }, [userID])


  if (isLoading) return <Loader fullScreen/>

  return (
    <UserContext.Provider value={{ user, setUser, refetch, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);