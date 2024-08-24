import React from "react";
import Lottie from "lottie-react";
import animationData from "../../assets/lottie/Chat.json";

const Welcome = () => {
  return (
    <div className="welcome">
      <h1 className="logo">ChatZone</h1>
      <Lottie
        animationData={animationData}
        style={{ width: "200px" }}
        loop={true}
      />
      <p className="text">Please select a chat to start Messaging.</p>
    </div>
  );
};

export default Welcome;
