import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import { Home } from "./pages/Home";
import { NewRoom } from "./pages/NewRoom";

import { AuthContextProvider } from "./contexts/AuthContext";
import { Room } from "./pages/Room";

import { Toaster } from "react-hot-toast";
import { AdminRoom } from "./pages/AdminRoom";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        toastOptions={{
          style: {
            background: '#fff',
            border: "1px solid #835AFD",
            padding: "24px 48px",
            color: "#835AFD",
          },
          iconTheme: {
            primary: "#835AFD",
            secondary: "#FFFAEE",
          },
          success: {
            style: {
              fontWeight: "normal",
              fontFamily: "Roboto",
            },
          },
        }}
      />
      <AuthContextProvider>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/rooms/new" component={NewRoom} />
          <Route path="/rooms/:id" component={Room} />
          <Route path="/admin/rooms/:id" component={AdminRoom} />

          <Redirect from="*" to="/" />
        </Switch>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
