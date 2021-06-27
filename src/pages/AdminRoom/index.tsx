import { useParams, Link, useHistory } from "react-router-dom";

import logoImg from "../../assets/images/logo.svg";
import deleteImg from "../../assets/images/delete.svg";
import checkImg from "../../assets/images/check.svg";
import answerImg from "../../assets/images/answer.svg";

import { RoomCode } from "../../components/RoomCode";
import { Button } from "../../components/Button";

import "../../styles/room.scss";

import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useRoom } from "../../hooks/useRoom";

import { RoomLoader } from "../../components/RoomLoader";
import { Question } from "../../components/Question";
import { Helmet, HelmetProvider } from "react-helmet-async";

import toast from "react-hot-toast";
import { database } from "../../services/firebase";

type RoomParams = {
  id: string;
};

export function AdminRoom() {
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { user } = useAuth();
  const { title, questions, owner } = useRoom(roomId);

  useEffect(() => {
    if (user) {
      if (owner !== "" && user.id !== owner) {
        history.push("/");

        toast.error("Você não é o dono desta sala.");
      }
    } else {
      history.push("/");

      toast.error(
        "Caso seja o dono desta sala, faça o login antes de acessar o painel de admin."
      );
    }
  }, [user, history, owner]);

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    });

    history.push("/");
    toast.success("Esta sala foi encerrada!");
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

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    const databaseRef = await database.ref(
      `rooms/${roomId}/questions/${questionId}`
    );
    const questionRef = await databaseRef.get();

    await databaseRef.update({
      isHighlighted: !questionRef.val().isHighlighted,
    });
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
              <Button
                isOutlined
                disabled={owner === ""}
                onClick={handleEndRoom}
              >
                Encerrar sala
              </Button>
            </div>
          </div>
        </header>

        {owner === "" ? (
          <RoomLoader loading={owner === ""} />
        ) : (
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
                    isAnswered={question.isAnswered}
                    isHighlighted={question.isHighlighted}
                  >
                    {!question.isAnswered && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            handleCheckQuestionAsAnswered(question.id);
                          }}
                        >
                          <img
                            src={checkImg}
                            alt="Marcar pergunta como respondida"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleHighlightQuestion(question.id);
                          }}
                        >
                          <img src={answerImg} alt="Dar destaque à pergunta" />
                        </button>
                      </>
                    )}
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
        )}
      </div>
    </HelmetProvider>
  );
}
