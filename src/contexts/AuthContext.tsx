import { createContext, ReactNode, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { auth, firebase } from "../services/firebase";

type User = {
  id: string;
  name: string;
  avatar: string;
  provider?: string;
};

type AuthContextType = {
  user: User | undefined;
  signIn: (provider: firebase.auth.AuthProvider) => Promise<User | undefined>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider({ ...props }: AuthContextProviderProps) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const { displayName, photoURL, uid } = firebaseUser;

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
          provider: firebaseUser.providerData[0]?.providerId,
        });
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function signIn(
    provider: firebase.auth.AuthProvider
  ): Promise<User | undefined> {
    if (user && user.provider === provider.providerId) {
      return user;
    }

    if (user) {
      await auth.signOut();
      setUser(undefined);
      toast.success("Você foi desconectado de sua conta.");
    }

    try {
      const response = await auth.signInWithPopup(provider);

      if (response.user) {
        const { displayName, photoURL, uid } = response.user;

        if (!displayName || !photoURL) {
          toast.error(
            "Sua conta não possui todos os dados necessários para fazer login."
          );
          return undefined;
        }

        const newUser = {
          id: uid,
          name: displayName,
          avatar: photoURL,
          provider: response.user.providerData[0]?.providerId,
        };

        setUser(newUser);
        return newUser;
      }
    } catch (e) {
      const err = e as firebase.FirebaseError;

      if (err.code === "auth/account-exists-with-different-credential") {
        toast.error(
          "Você já possui uma conta com este e-mail atrelado a outro provedor."
        );
      } else {
        toast.error("Ocorreu um erro ao logar em sua conta.");
      }

      return undefined;
    }
  }

  if (loading) {
    return <></>;
  }

  return (
    <AuthContext.Provider value={{ user, signIn }}>
      {props.children}
    </AuthContext.Provider>
  );
}
