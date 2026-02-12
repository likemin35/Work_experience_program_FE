import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CampaignListPage.css";

type Campaign = {
  campaignId: string;
  title: string;
  status: string;
};

const CampaignListPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/campaigns")
      .then((res) => setCampaigns(res.data))
      .finally(() => setIsLoading(false));
  }, []);

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
          {campaigns.map((c) => (
            <tr key={c.campaignId}>
              <td>{c.title}</td>
              <td>{c.status}</td>
              <td>
                {c.status === "SEGMENTED" && (
                  <button
                    onClick={() =>
                      navigate(`/campaign/${c.campaignId}/segments`)
                    }
                  >
                    세그먼트 보기
                  </button>
                )}

                {c.status === "MESSAGE_GENERATED" && (
                  <button
                    onClick={() =>
                      navigate(`/campaign/${c.campaignId}`)
                    }
                  >
                    메시지 보기
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignListPage;
