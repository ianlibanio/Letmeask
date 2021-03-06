import { FormEvent, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";

import illustrationImg from "../../assets/images/illustration.svg";
import logoImg from "../../assets/images/logo.svg";

import { Button } from "../../components/Button";
import { database } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";

import { Helmet, HelmetProvider } from "react-helmet-async";
import "../../styles/room.scss";
import toast from "react-hot-toast";

export function NewRoom() {
  const { user } = useAuth();
  const history = useHistory();
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    if (!user) {
      history.push("/");

      toast.error("Você deve entrar em sua conta antes de criar uma sala.");
    }
  }, [user, history]);

  async function handleCreateRoom(event: FormEvent) {
    event.preventDefault();

    if (newRoom.trim() === "") {
      return;
    }

    const roomRef = database.ref("rooms");

    const firebaseRoom = await roomRef.push({
      title: newRoom,
      authorId: user?.id,
    });

    history.push(`/admin/rooms/${firebaseRoom.key}`);
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
            <h2>Crie uma nova sala</h2>
            <form onSubmit={handleCreateRoom}>
              <input
                type="text"
                placeholder="Nome da sala"
                onChange={(event) => setNewRoom(event.target.value)}
                value={newRoom}
              />
              <Button type="submit">Criar sala</Button>
            </form>
            <p>
              Quer entrar em uma sala existente? <Link to="/">Clique aqui</Link>
            </p>
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
}
