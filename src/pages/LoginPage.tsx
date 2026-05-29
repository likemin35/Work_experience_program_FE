import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const LoginPage = () => {
  const { loginWithMicrosoft, loginWithTest } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await loginWithTest(username, password);
      navigate("/campaigns", { replace: true });
    } catch {
      setError("테스트 계정 로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="main-content" style={{ paddingTop: "96px" }}>
      <div
        style={{
          maxWidth: "420px",
          margin: "0 auto",
          padding: "32px",
          borderRadius: "20px",
          background: "#ffffff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "12px" }}>업무 툴 로그인</h1>
        <p style={{ marginBottom: "24px", color: "#52525b" }}>
          회사 계정은 Microsoft Entra ID로 로그인하고, 예외 테스트 계정은 아래 폼으로 로그인합니다.
        </p>

        <button
          onClick={loginWithMicrosoft}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "12px",
            border: "none",
            background: "#111827",
            color: "#ffffff",
            cursor: "pointer",
            marginBottom: "24px",
          }}
        >
          Microsoft 회사 계정 로그인
        </button>

        <form onSubmit={handleSubmit}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="테스트 ID"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "10px",
              border: "1px solid #d4d4d8",
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="테스트 비밀번호"
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "10px",
              border: "1px solid #d4d4d8",
            }}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #18181b",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            {isSubmitting ? "로그인 중..." : "테스트 계정 로그인"}
          </button>
        </form>

        {error && (
          <p style={{ marginTop: "12px", color: "#dc2626" }}>{error}</p>
        )}
      </div>
    </main>
  );
};

export default LoginPage;
