import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import "./MessageResultPage.css";

type CampaignDetail = {
  campaignId: string;
  title: string;
  status: string;
  errorMessage?: string | null;
  canStartSegmentation: boolean;
  canStartMessageGeneration: boolean;
  canDownloadSegmentedCsv: boolean;
  canDownloadMessageCsv: boolean;
};

type MessageResult = {
  resultId: string;
  targetGroupIndex: number;
  targetName: string;
  targetFeatures: string;
  strategyMode?: string;
  strategyReason?: string;
  strategyReferences?: string;
  messageText: string;
};

const STATUS_LABELS: Record<string, string> = {
  UPLOADED: "업로드 완료",
  SEGMENTING: "분류 중",
  SEGMENTED: "분류 완료",
  MESSAGE_GENERATING: "메시지 생성 중",
  MESSAGE_GENERATED: "메시지 생성 완료",
  SEGMENT_FAILED: "분류 실패",
  MESSAGE_FAILED: "메시지 생성 실패",
};

const MessageResultPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [messages, setMessages] = useState<MessageResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRequestingMessageGeneration, setIsRequestingMessageGeneration] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchPageData = async () => {
      try {
        const campaignRes = await api.get(`/api/campaigns/${campaignId}`);
        const campaignDetail = campaignRes.data as CampaignDetail;

        if (!mounted) {
          return;
        }

        setCampaign(campaignDetail);

        if (campaignDetail.status === "MESSAGE_GENERATED") {
          const messageRes = await api.get(`/api/campaigns/${campaignId}/messages`);
          if (mounted) {
            setMessages(messageRes.data);
          }
        } else if (mounted) {
          setMessages([]);
        }

        if (mounted) {
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError("메시지 상태를 불러오지 못했습니다.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPageData();
    const intervalId = window.setInterval(fetchPageData, 4000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [campaignId]);

  const handleDownloadMessageCsv = async () => {
    try {
      setIsDownloading(true);

      const res = await api.get(
        `/api/campaigns/${campaignId}/message-csv`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customer_messages_${campaignId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("고객별 메시지 CSV 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRequestMessageGeneration = async () => {
    try {
      setIsRequestingMessageGeneration(true);
      const res = await api.post(`/api/campaigns/${campaignId}/message-generation-jobs`);
      setCampaign((prev) =>
        prev ? { ...prev, status: res.data.status, errorMessage: null } : prev
      );
    } catch (e) {
      alert("메시지 생성 작업 등록에 실패했습니다.");
    } finally {
      setIsRequestingMessageGeneration(false);
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
      <h1>{campaign?.title || "캠페인"} 메시지 상태</h1>

      <div className="message-page-status">
        현재 상태: {campaign ? STATUS_LABELS[campaign.status] || campaign.status : "-"}
      </div>

      {campaign?.errorMessage && (
        <div className="message-page-status error">{campaign.errorMessage}</div>
      )}

      <div className="message-top-actions">
        <button
          className="csv-btn"
          onClick={handleDownloadMessageCsv}
          disabled={!campaign?.canDownloadMessageCsv || isDownloading}
        >
          {isDownloading ? "CSV 생성 중.." : "고객별 메시지 CSV 다운로드"}
        </button>

        {campaign?.canStartMessageGeneration && (
          <button
            className="csv-btn"
            onClick={handleRequestMessageGeneration}
            disabled={isRequestingMessageGeneration}
          >
            {isRequestingMessageGeneration ? "작업 등록 중.." : "메시지 생성 시작"}
          </button>
        )}

        <button
          className="csv-btn"
          onClick={() => navigate(`/campaign/${campaignId}/segments`)}
        >
          세그먼트 화면으로
        </button>
      </div>

      {campaign?.status === "MESSAGE_GENERATED" &&
        messages.map((msg) => (
          <div key={msg.resultId} className="message-card">
            <div className="message-header">
              <h3>{msg.targetName}</h3>
            </div>

            <p className="message-features">{msg.targetFeatures}</p>

            {(msg.strategyMode || msg.strategyReason || msg.strategyReferences) && (
              <div className="message-features">
                <div><strong>Strategy mode:</strong> {msg.strategyMode || "-"}</div>
                <div><strong>Reason:</strong> {msg.strategyReason || "-"}</div>
                <div><strong>References:</strong> {msg.strategyReferences || "[]"}</div>
              </div>
            )}

            <div className="message-body">
              {msg.messageText}
            </div>

            <div className="message-actions">
              <button
                onClick={() =>
                  navigate(`/campaign/${campaignId}/messages/${msg.resultId}/edit`)
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
