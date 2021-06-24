import Helmet from "react-helmet";

type GlobalHeaderProps = {
  title: string;
};

export function GlobalHeader(props: GlobalHeaderProps) {
  return(
    <Helmet
        title={props.title}
        meta={[
          {
            property: "description",
            content:
              "Crie salas de Q&amp;A ao-vivo e tire as dúvidas da sua audiência em tempo-real.",
          },
          {
            property: "og:title",
            content: "Letmeask",
          },
          {
            property: "og:description",
            content:
              "Crie salas de Q&amp;A ao-vivo e tire as dúvidas da sua audiência em tempo-real.",
          },
          {
            property: "og:image",
            content: "https://raw.githubusercontent.com/ianlibanio/Letmeask/6e91b71e3ce400a3b069f1153537bacfa898d6fc/.github/banner.svg",
          },
          {
            name: "theme-color",
            content: "#835afd",
          },
        ]}
      />
  );
}