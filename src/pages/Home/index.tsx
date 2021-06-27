import { useHistory } from "react-router-dom";
import { FormEvent, useState } from "react";

import logoImg from "../../assets/images/logo.svg";
import illustrationImg from "../../assets/images/illustration.svg";

import googleIconImg from "../../assets/images/google-icon.svg";
import githubIconImg from "../../assets/images/github-icon.svg";

import { firebase, database } from "../../services/firebase";

import { Button } from "../../components/Button";
import { useAuth } from "../../hooks/useAuth";

import "./index.scss";

import { Helmet, HelmetProvider } from "react-helmet-async";
import toast from "react-hot-toast";

export function Home() {
  const history = useHistory();
  const { signIn } = useAuth();
  const [roomCode, setRoomCode] = useState("");

  async function handleCreateRoom(signInProvider: firebase.auth.AuthProvider) {
    const user = await signIn(signInProvider);

    if (user !== undefined) {
      history.push("/rooms/new");
    }
  }

  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();

    if (roomCode.trim() === "" || roomCode.match(/[.$[\]#/]/)) {
      toast.error("Código inválido.");
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()) {
      toast.error("Esta sala não existe.");
      return;
    }

    if (roomRef.val().endedAt) {
      toast.error("Esta sala já foi encerrada!");
      return;
    }

    history.push(`/rooms/${roomCode}`);
  }

  return (
    <HelmetProvider>
      <div id="page-auth">
        <Helmet title="Letmeask - Crie salas de Q&amp;A ao-vivo">
          <link rel="icon" href={logoImg} sizes="any" type="image/svg+xml" />
        </Helmet>
        <aside>
          <img
            src={illustrationImg}
            alt="Ilustração simbolizando perguntas e respostas"
          />
          <strong>Crie salas de Q&amp;A ao-vivo</strong>
          <p>Tire as dúvidas da sua audiência em tempo-real</p>
        </aside>
        <main>
          <div className="main-content">
            <img src={logoImg} alt="Letmeask" />

            <button
              onClick={() =>
                handleCreateRoom(new firebase.auth.GoogleAuthProvider())
              }
              className="create-room top"
            >
              <img src={googleIconImg} alt="Logo do Google" />
              Crie sua sala com o Google
            </button>

            <div className="separator auth">ou</div>

            <button
              onClick={() =>
                handleCreateRoom(new firebase.auth.GithubAuthProvider())
              }
              className="create-room"
            >
              <img src={githubIconImg} alt="Logo do GitHub" />
              Crie sua sala com o Github
            </button>

            <div className="separator join">ou entre em uma sala</div>

            <form onSubmit={handleJoinRoom}>
              <input
                type="text"
                placeholder="Digite o código da sala"
                onChange={(event) => setRoomCode(event.target.value)}
                value={roomCode}
              />
              <Button type="submit">Entrar na sala</Button>
            </form>
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
}
