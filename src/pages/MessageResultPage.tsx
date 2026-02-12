import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "./MessageResultPage.css";

type MessageResult = {
  resultId: string;
  targetGroupIndex: number;
  targetName: string;
  targetFeatures: string;
  messageText: string;
};

const MessageResultPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<MessageResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(
          `/api/campaigns/${campaignId}/messages`
        );
        setMessages(res.data);
      } catch (e) {
        setError("메시지 생성 결과를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [campaignId]);

  // ✅ 고객별 메시지 CSV 다운로드
  const handleDownloadMessageCsv = async () => {
    try {
      setIsDownloading(true);

      const res = await api.get(
        `/api/campaigns/${campaignId}/messages/csv`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `customer_messages_${campaignId}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("고객별 메시지 CSV 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="message-page-status">로딩 중...</div>;
  }

  if (error) {
    return <div className="message-page-status error">{error}</div>;
  }

  return (
    <div className="message-result-container">
      <h1>메시지 생성 결과</h1>

      {/* ✅ 상단 액션 영역 */}
      <div className="message-top-actions">
        <button
          className="csv-btn"
          onClick={handleDownloadMessageCsv}
          disabled={isDownloading}
        >
          {isDownloading ? "CSV 생성 중..." : "고객별 메시지 CSV 다운로드"}
        </button>
      </div>

      {messages.map((msg) => (
        <div key={msg.resultId} className="message-card">
          <div className="message-header">
            <h3>{msg.targetName}</h3>
          </div>

          <p className="message-features">{msg.targetFeatures}</p>

          <div className="message-body">
            {msg.messageText}
          </div>

          <div className="message-actions">
            <button
              onClick={() =>
                navigate(
                  `/campaign/${campaignId}/messages/${msg.resultId}/edit`
                )
              }
            >
              수정
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageResultPage;
