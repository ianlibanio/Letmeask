import { SyncLoader } from "react-spinners";

type RoomLoaderType = {
  loading: boolean;
};

export function RoomLoader({ loading }: RoomLoaderType) {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <SyncLoader color="#835AFD" loading={loading} size={20} />
    </div>
  );
}
