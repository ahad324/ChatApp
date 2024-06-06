import React, { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "react-feather";

function LoginPage() {
  const { user, handleUserLogin } = useAuth();
  const navigate = useNavigate();
  const [viewPass, setviewPass] = useState("password");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await handleUserLogin(e, credentials);

    if (response.error) {
      toast.error("Invalid email or password. Please try again.");
    }
  };

  const toggleViewPassword = () => {
    setviewPass((prevState) =>
      prevState === "password" ? "text" : "password"
    );
  };
  return (
    <div className="auth--container">
      <div className="form--wrapper">
        <form onSubmit={handleSubmit}>
          <div className="field--wrapper">
            <label htmlFor="Email">Email:</label>
            <input
              autoComplete="true"
              type="email"
              required
              name="email"
              placeholder="Enter your email..."
              value={credentials.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="field--wrapper">
            <label htmlFor="Password">Password:</label>
            <span className="password--span">
              <input
                type={viewPass}
                required
                name="password"
                placeholder="Enter your password..."
                value={credentials.password}
                onChange={handleInputChange}
              />
              {viewPass === "password" ? (
                <Eye className="Eye" onClick={toggleViewPassword} />
              ) : (
                <EyeOff className="Eye" onClick={toggleViewPassword} />
              )}
            </span>
          </div>
          <div className="field--wrapper">
            <input
              className="btn btn--lg btn--main"
              type="submit"
              value="Login"
            />
          </div>
        </form>
        <p>
          Don't have an account ? Register <Link to="/register">here</Link>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginPage;
