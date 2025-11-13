import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Layout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/"); // nếu chưa đăng nhập -> quay về trang login
      }
    });
    return unsubscribe;
  }, [router]);

  return <Slot />;
}
