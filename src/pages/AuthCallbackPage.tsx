import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const AuthCallbackPage = () => {
  const { refresh } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      await refresh();
      navigate("/campaigns", { replace: true });
    };

    run();
  }, [navigate, refresh]);

  return <div className="campaign-list-status">로그인 확인 중...</div>;
};

export default AuthCallbackPage;
