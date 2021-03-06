import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type FirebaseQuestions = Record<
  string,
  {
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likes: Record<
      string,
      {
        authorId: string;
      }
    >;
  }
>;

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likeCount: number;
  likeId: string | undefined;
};

export function useRoom(roomId: string) {
  const history = useHistory();

  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  
  const [title, setTitle] = useState("");
  const [ended, setEnded] = useState(false);
  const [owner, setOwner] = useState("");

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on("value", (room) => {
      const databaseRoom = room.val();

      if (databaseRoom === null) {
        history.push('/');
        toast.error('Esta sala não existe.');
        return;
      }
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

      const parsedQuestions = Object.entries(firebaseQuestions)
        .map(([key, value]) => {
          return {
            id: key,
            content: value.content,
            author: value.author,
            isHighlighted: value.isHighlighted,
            isAnswered: value.isAnswered,
            likeCount: Object.values(value.likes ?? {}).length,
            likeId: Object.entries(value.likes ?? {}).find(
              ([key, like]) => like.authorId === user?.id
            )?.[0],
          };
        })
        .sort((x, y) => Number(y.isHighlighted) - Number(x.isHighlighted))
        .sort((x, y) => y.likeCount - x.likeCount)
        .sort((x, y) => Number(y.isAnswered) - Number(x.isAnswered));

      setTitle(databaseRoom.title);
      setOwner(databaseRoom.authorId);

      setQuestions(parsedQuestions);
      setEnded(databaseRoom.endedAt !== undefined);
    });
    return () => {
      roomRef.off("value");
    };
  }, [roomId, user?.id, history]);

  return { questions, title, ended, owner };
}
