import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "./MessageEditPage.css";

type MessageResult = {
  resultId: string;
  targetName: string;
  targetFeatures: string;
  messageText: string;
};

const MessageEditPage = () => {
  const { campaignId, resultId } = useParams<{
    campaignId: string;
    resultId: string;
  }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState<MessageResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await api.get(
          `/api/campaigns/${campaignId}/messages`
        );
        const found = res.data.find(
          (m: MessageResult) => m.resultId === resultId
        );
        setMessage(found);
      } catch (e) {
        setError("메시지를 불러오지 못했습니다.");
      }
    };

    fetchMessage();
  }, [campaignId, resultId]);

  const handleSave = async () => {
    if (!message) return;

    try {
      setIsSaving(true);
      await api.patch(`/api/campaigns/messages/${message.resultId}`, {
        messageText: message.messageText
      });
      navigate(`/campaign/${campaignId}`);
    } catch (e) {
      alert("메시지 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return <div className="message-edit-status error">{error}</div>;
  }

  if (!message) {
    return <div className="message-edit-status">로딩 중...</div>;
  }

  return (
    <div className="message-edit-container">
      <h1>메시지 수정</h1>

      <div className="edit-section">
        <h3>{message.targetName}</h3>
        <p className="target-features">{message.targetFeatures}</p>

        <textarea
          value={message.messageText ?? ""}
          onChange={(e) =>
            setMessage({
              ...message,
              messageText: e.target.value,
            })
          }
        />

        <div className="edit-actions">
          <button
            className="cancel-btn"
            onClick={() => navigate(`/campaign/${campaignId}`)}
          >
            취소
          </button>
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageEditPage;
