import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credentials, setcredentials] = useState({ email: "", password: "" });
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);
  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setcredentials({
      ...credentials,
      [name]: value,
    });
  };
  return <div>LoginPage</div>;
}

export default LoginPage;
