import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import "./CampaignSegmentResultPage.css";

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

type CustomerSegment = {
  customerId: string;
  phoneNumber: string;
  customerName: string;
  targetSegment: string;
  segmentReason: string;
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

const CampaignSegmentResultPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingSegmentation, setIsRequestingSegmentation] = useState(false);
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

        if (
          ["SEGMENTED", "MESSAGE_GENERATING", "MESSAGE_GENERATED", "MESSAGE_FAILED"]
            .includes(campaignDetail.status)
        ) {
          const segmentRes = await api.get(`/api/campaigns/${campaignId}/segments`);
          if (mounted) {
            setSegments(segmentRes.data);
          }
        } else if (mounted) {
          setSegments([]);
        }

        if (mounted) {
          setError(null);
        }
      } catch (e) {
        if (mounted) {
          setError("캠페인 상태 또는 세그먼트 결과를 불러오지 못했습니다.");
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

  const handleRequestSegmentation = async () => {
    try {
      setIsRequestingSegmentation(true);
      const res = await api.post(`/api/campaigns/${campaignId}/segmentation-jobs`);
      setCampaign((prev) =>
        prev ? { ...prev, status: res.data.status, errorMessage: null } : prev
      );
    } catch (e) {
      alert("타겟 분류 작업 등록에 실패했습니다.");
    } finally {
      setIsRequestingSegmentation(false);
    }
  };

  const handleGenerateMessages = async () => {
    try {
      setIsRequestingMessageGeneration(true);
      await api.post(`/api/campaigns/${campaignId}/message-generation-jobs`);
      navigate(`/campaign/${campaignId}`);
    } catch (e) {
      alert("메시지 생성 작업 등록에 실패했습니다.");
      setIsRequestingMessageGeneration(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const res = await api.get(
        `/api/campaigns/${campaignId}/segmented-csv`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customer_segments_${campaignId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("세그먼트 CSV 다운로드에 실패했습니다.");
    }
  };

  if (isLoading) {
    return <div className="segment-page-status">로딩 중...</div>;
  }

  if (error) {
    return <div className="segment-page-status error">{error}</div>;
  }

  return (
    <div className="segment-result-container">
      <h1>{campaign?.title || "캠페인"} 세그먼트 상태</h1>

      <div className="segment-page-status">
        현재 상태: {campaign ? STATUS_LABELS[campaign.status] || campaign.status : "-"}
      </div>

      {campaign?.errorMessage && (
        <div className="segment-page-status error">{campaign.errorMessage}</div>
      )}

      <div className="segment-actions">
        <button
          className="csv-btn"
          onClick={handleDownloadCsv}
          disabled={!campaign?.canDownloadSegmentedCsv}
        >
          그룹화 CSV 다운로드
        </button>
        <button
          className="generate-btn"
          onClick={handleRequestSegmentation}
          disabled={!campaign?.canStartSegmentation || isRequestingSegmentation}
        >
          {isRequestingSegmentation ? "분류 작업 등록 중.." : "타겟 분류 시작"}
        </button>
        <button
          className="generate-btn"
          onClick={handleGenerateMessages}
          disabled={!campaign?.canStartMessageGeneration || isRequestingMessageGeneration}
        >
          {isRequestingMessageGeneration ? "메시지 작업 등록 중.." : "메시지 생성"}
        </button>
      </div>

      {campaign?.status === "MESSAGE_GENERATED" && (
        <div className="segment-actions">
          <button className="generate-btn" onClick={() => navigate(`/campaign/${campaignId}`)}>
            메시지 결과 보기
          </button>
        </div>
      )}

      {segments.length > 0 && (
        <div className="segment-table-wrapper">
          <table className="segment-table">
            <thead>
              <tr>
                <th>고객 ID</th>
                <th>고객명</th>
                <th>휴대폰번호</th>
                <th>타겟 세그먼트</th>
                <th>세그먼트 사유</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, idx) => (
                <tr key={idx}>
                  <td>{seg.customerId}</td>
                  <td>{seg.customerName}</td>
                  <td>{seg.phoneNumber}</td>
                  <td className="highlight">{seg.targetSegment}</td>
                  <td>{seg.segmentReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignSegmentResultPage;
