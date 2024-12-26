import { OrbitProgress } from "react-loading-indicators";

const Loading = () => {
  return (
    <div className="loading-overlay">
      <OrbitProgress dense color="#000" size="medium" text="Loading" textColor="#000" />
    </div>
  );
};

export default Loading;
