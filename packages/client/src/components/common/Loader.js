import React from "react";
import LoaderData from "../../assets/lottie/loader.json";
import Lottie from "lottie-react";

const Loader = () => {
  return (
    <div className="loader">
      <Lottie className="main-loader" animationData={LoaderData} loop></Lottie>
    </div>
  );
};

export default Loader;
