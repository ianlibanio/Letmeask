import { FormEvent, useEffect, useState } from "react";
import { useParams, Link, useHistory } from "react-router-dom";

import Modal from "react-modal";

import logoImg from "../../assets/images/logo.svg";
import googleIconImg from "../../assets/images/google-icon.svg";
import githubIconImg from "../../assets/images/github-icon.svg";

import { RoomCode } from "../../components/RoomCode";
import { Button } from "../../components/Button";

import "../../styles/room.scss";
import "./modal.scss";

import toast from "react-hot-toast";

import { RoomLoader } from "../../components/RoomLoader";
import { Question } from "../../components/Question";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { database, firebase } from "../../services/firebase";
import { useAuth } from "../../hooks/useAuth";
import { useRoom } from "../../hooks/useRoom";

type RoomParams = {
  id: string;
};

export function Room() {
  const { user, signIn } = useAuth();

  const [newQuestion, setNewQuestion] = useState("");
  const [showModal, setShowModal] = useState(false);

  const params = useParams<RoomParams>();
  const roomId = params.id;

  const history = useHistory();

  const { title, questions, ended, owner } = useRoom(roomId);

  Modal.setAppElement("#root");

  useEffect(() => {
    if (ended) {
      history.push("/");

      toast.success("Esta sala foi encerrada!");
    }
  }, [ended, history]);

  async function pushQuestion(question: {}) {
    await database.ref(`rooms/${roomId}/questions`).push(question);
  }

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();

    if (newQuestion.trim() === "") {
      toast.error("A pergunta inserida é inválida.");
      return;
    }

    if (!user) {
      toast.error("Você deve estar logado para enviar uma pergunta.");
      return;
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    };

    toast.promise(pushQuestion(question), {
      loading: "Enviando pergunta...",
      success: <b>Pergunta enviada com sucesso!</b>,
      error: <b>Ocorreu um erro ao enviar sua pergunta.</b>,
    });

    setNewQuestion("");
  }

  async function handleLikeQuestion(
    questionId: string,
    likeId: string | undefined
  ) {
    if (likeId) {
      await database
        .ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`)
        .remove();
    } else {
      await database.ref(`rooms/${roomId}/questions/${questionId}/likes`).push({
        authorId: user?.id,
      });
    }
  }

  async function handleLogin(signInProvider: firebase.auth.AuthProvider) {
    const user = await signIn(signInProvider);

    if (user !== undefined) {
      setShowModal(false);
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
            <RoomCode code={roomId} />
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

            <form onSubmit={handleSendQuestion}>
              <textarea
                placeholder="O que você quer perguntar?"
                onChange={(event) => setNewQuestion(event.target.value)}
                value={newQuestion}
              />

              <div className="form-footer">
                {user ? (
                  <div className="user-info">
                    <img src={user.avatar} alt={user.name} />
                    <span>{user.name}</span>
                  </div>
                ) : (
                  <>
                    <span>
                      Para enviar uma pergunta,{" "}
                      <button
                        onClick={async (event) => {
                          event.preventDefault();

                          setShowModal(true);
                        }}
                      >
                        faça seu login
                      </button>
                      .
                    </span>
                    <Modal
                      isOpen={showModal}
                      contentLabel={"Escolher opção de login."}
                      onRequestClose={() => {
                        setShowModal(false);
                      }}
                      style={{
                        content: {
                          top: "50%",
                          left: "50%",
                          right: "auto",
                          bottom: "auto",
                          padding: "80px 224px",
                          marginRight: "-50%",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "12px",
                        },
                        overlay: {
                          backgroundColor: "rgba(5,2,6,0.8)",
                        },
                      }}
                    >
                      <div className="modal-content">
                        <img src={logoImg} alt="Letmeask" />
                        <p>Escolha uma opção para fazer login:</p>

                        <button
                          onClick={() =>
                            handleLogin(new firebase.auth.GoogleAuthProvider())
                          }
                          className="auth-button top"
                        >
                          <img src={googleIconImg} alt="Logo do Google" />
                          Faça login com Google
                        </button>

                        <div className="separator">ou</div>

                        <button
                          onClick={() =>
                            handleLogin(new firebase.auth.GithubAuthProvider())
                          }
                          className="auth-button"
                        >
                          <img src={githubIconImg} alt="Logo do GitHub" />
                          Faça login com Github
                        </button>
                      </div>
                    </Modal>
                  </>
                )}
                <Button type="submit" disabled={!user}>
                  Enviar pergunta
                </Button>
              </div>
            </form>

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
                      <button
                        className={`like-button ${
                          question.likeId ? "liked" : ""
                        }`}
                        type="button"
                        aria-label="Marcar como gostei"
                        onClick={() =>
                          handleLikeQuestion(question.id, question.likeId)
                        }
                      >
                        {question.likeCount > 0 && (
                          <span>{question.likeCount}</span>
                        )}
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z"
                            stroke="#737380"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
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
