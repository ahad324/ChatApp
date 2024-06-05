import React from "react";
import "../styles/Loader.css";
const Loader = () => {
  return (
    <section className="Loader--Container">
      <div className="loader-box">
        <div className="loading-wrapper">
          <div className="loader">
            <div className="loader-inner"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Loader;
