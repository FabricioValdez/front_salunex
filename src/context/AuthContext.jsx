import { createContext } from "react";

const AuthContext = createContext({
  user: null,
  loginUser: () => {},
  logoutUser: () => {},
});

export default AuthContext;