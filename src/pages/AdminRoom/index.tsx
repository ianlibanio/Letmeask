import { useParams, Link, useHistory } from "react-router-dom";

import logoImg from "../../assets/images/logo.svg";
import deleteImg from "../../assets/images/delete.svg";

import { RoomCode } from "../../components/RoomCode";
import { Button } from "../../components/Button";

import "../../styles/room.scss";

import { Question } from "../../components/Question";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { database } from "../../services/firebase";
import { useRoom } from "../../hooks/useRoom";
import toast from "react-hot-toast";

type RoomParams = {
  id: string;
};

export function AdminRoom() {
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { title, questions } = useRoom(roomId);

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date()
    });

    history.push('/');
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm("Tem certeza que você deseja excluir esta pergunta?")) {
      const questionRef = database
        .ref(`rooms/${roomId}/questions/${questionId}`)
        .remove();

      toast.promise(questionRef, {
        loading: "Excluindo pergunta...",
        success: <b>Pergunta excluída com sucesso!</b>,
        error: <b>Não foi possível excluir esta pergunta.</b>,
      });
    }
  }

  return (
    <HelmetProvider>
      <div id="page-room">
        <Helmet title={`Letmeask - Sala #${roomId}`}>
          <link rel="icon" href={logoImg} sizes="any" type="image/svg+xml" />
        </Helmet>
        <header>
          <div className="content">
            <Link to="/">
              <img src={logoImg} alt="Letmeask" />
            </Link>
            <div>
              <RoomCode code={roomId} />
              <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
            </div>
          </div>
        </header>

        <main>
          <div className="room-title">
            <h1>Sala {title}</h1>
            {questions.length > 0 && (
              <span>{questions.length} pergunta(s)</span>
            )}
          </div>

          <div className="question-list">
            {questions.map((question) => {
              return (
                <Question
                  key={question.id}
                  content={question.content}
                  author={question.author}
                >
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteQuestion(question.id);
                    }}
                  >
                    <img src={deleteImg} alt="Remover pergunta" />
                  </button>
                </Question>
              );
            })}
          </div>
        </main>
      </div>
    </HelmetProvider>
  );
}
