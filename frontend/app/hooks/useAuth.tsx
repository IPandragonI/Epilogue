'use client';

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: 'include',
        });

        if (!res.ok) {
          setUser(null);

          if (res.status === 401 && !PUBLIC_PATHS.some((p) => pathname?.startsWith(p))) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: "POST",
              credentials: "include",
            }).finally(() => {
              window.location.href = "/login";
            });
          }

          return;
        }

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname]);

  return { user, loading, setUser };
}