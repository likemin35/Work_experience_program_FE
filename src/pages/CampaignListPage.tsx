import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CampaignListPage.css";

type Campaign = {
  campaignId: string;
  title: string;
  status: string;
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

const isViewableStatus = (status: string) =>
  [
    "UPLOADED",
    "SEGMENTED",
    "MESSAGE_GENERATING",
    "MESSAGE_GENERATED",
    "SEGMENT_FAILED",
    "MESSAGE_FAILED",
  ].includes(status);

const CampaignListPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchCampaigns = async () => {
      try {
        const res = await api.get("/api/campaigns");
        if (mounted) {
          setCampaigns(res.data);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCampaigns();
    const intervalId = window.setInterval(fetchCampaigns, 4000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleDeleteCampaign = async (campaignId: string) => {
    const confirmed = window.confirm("이 프로모션을 삭제할까요?");
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/api/campaigns/${campaignId}`);
      setCampaigns((prev) =>
        prev.filter((campaign) => campaign.campaignId !== campaignId)
      );
    } catch (error) {
      alert("프로모션 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <div className="campaign-list-status">로딩 중...</div>;
  }

  return (
    <div className="campaign-list-container">
      <h1>프로모션 목록</h1>

      <table className="campaign-table">
        <thead>
          <tr>
            <th>프로모션명</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.campaignId}>
              <td>{campaign.title}</td>
              <td>{STATUS_LABELS[campaign.status] || campaign.status}</td>
              <td>
                <button
                  disabled={!isViewableStatus(campaign.status)}
                  onClick={() => {
                    if (!isViewableStatus(campaign.status)) {
                      return;
                    }

                    navigate(
                      campaign.status === "MESSAGE_GENERATED"
                        ? `/campaign/${campaign.campaignId}`
                        : `/campaign/${campaign.campaignId}/segments`
                    );
                  }}
                >
                  상세 보기
                </button>
                <button
                  onClick={() => handleDeleteCampaign(campaign.campaignId)}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignListPage;
