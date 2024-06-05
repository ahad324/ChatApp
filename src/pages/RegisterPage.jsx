import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { Eye, EyeOff } from "react-feather";

const RegisterPage = () => {
  const { handleUserRegister } = useAuth();
  const [viewPass1, setviewPass1] = useState("password");
  const [viewPass2, setviewPass2] = useState("password");

  const [credentials, setcredentials] = useState({
    name: "",
    email: "",
    password1: "",
    password2: "",
  });

  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setcredentials({
      ...credentials,
      [name]: value,
    });
  };

  const toggleViewPassword1 = () => {
    setviewPass1((prevState) =>
      prevState === "password" ? "text" : "password"
    );
  };

  const toggleViewPassword2 = () => {
    setviewPass2((prevState) =>
      prevState === "password" ? "text" : "password"
    );
  };
  return (
    <div className="auth--container">
      <div className="form--wrapper">
        <form onSubmit={(e) => handleUserRegister(e, credentials)}>
          <div className="field--wrapper">
            <label htmlFor="Name">Name:</label>
            <input
              autoComplete="true"
              type="text"
              required
              name="name"
              placeholder="Enter your name..."
              value={credentials.name}
              onChange={handleInputChange}
            />
          </div>
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
                type={viewPass1}
                required
                name="password1"
                placeholder="Enter your password..."
                value={credentials.password1}
                onChange={handleInputChange}
              />
              {viewPass1 === "password" ? (
                <Eye onClick={toggleViewPassword1} />
              ) : (
                <EyeOff onClick={toggleViewPassword1} />
              )}
            </span>
          </div>
          <div className="field--wrapper">
            <label htmlFor="Confirm Password">Confirm Password:</label>
            <span className="password--span">
              <input
                type={viewPass2}
                required
                name="password2"
                placeholder="Confirm your password..."
                value={credentials.password2}
                onChange={handleInputChange}
              />
              {viewPass2 === "password" ? (
                <Eye onClick={toggleViewPassword2} />
              ) : (
                <EyeOff onClick={toggleViewPassword2} />
              )}
            </span>
          </div>
          <div className="field--wrapper">
            <input
              className="btn btn--lg btn--main"
              type="submit"
              value="Sign Up"
            />
          </div>
        </form>
        <p>
          Already have an account ? Login <Link to="/login">here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
