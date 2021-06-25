import { createContext, ReactNode, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { auth, firebase } from "../services/firebase";

type User = {
  id: string;
  name: string;
  avatar: string;
};

type AuthContextType = {
  user: User | undefined;
  signIn: (provider: firebase.auth.AuthProvider) => Promise<void>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, photoURL, uid } = user;

        if (!displayName || !photoURL) {
          toast.error(
            "Sua conta não possui todos os dados necessários para fazer login."
          );
          return;
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function throwError(error: string) {
    toast.error(error);
    throw Error(error);
  }

  async function signIn(provider: firebase.auth.AuthProvider) {
    if (user) {
      await auth.signOut();
      toast.success("Você foi desconectado de sua conta.");
    }

    await auth
      .signInWithPopup(provider)
      .then((result) => {
        if (result.user) {
          const { displayName, photoURL, uid } = result.user;

          if (!displayName || !photoURL) {
            toast.error(
              "Sua conta não possui todos os dados necessários para fazer login."
            );
            return;
          }

          setUser({
            id: uid,
            name: displayName,
            avatar: photoURL,
          });
        }
      })
      .catch((err) => {
        if (err.code === "auth/account-exists-with-different-credential") {
          throwError(
            "Você já possui uma conta com este e-mail atrelado a outro provedor."
          );
        } else {
          throwError("Ocorreu um erro ao criar sua conta.");
        }
      });
  }

  return (
    <AuthContext.Provider value={{ user, signIn }}>
      {props.children}
    </AuthContext.Provider>
  );
}
