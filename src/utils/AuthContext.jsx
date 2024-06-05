import { createContext, useState, useEffect, useContext } from "react";
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [loading, setloading] = useState(true);
  const [user, setuser] = useState(true);

  useEffect(() => {
    setloading(false);
  }, []);

  const contextData = { user };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <p>Loading...</p> : children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  return useContext(AuthContext);
};
export default AuthContext;
