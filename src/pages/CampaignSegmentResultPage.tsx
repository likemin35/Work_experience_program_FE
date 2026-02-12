import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "./CampaignSegmentResultPage.css";

type CustomerSegment = {
  customerId: string;
  phoneNumber : string;
  customerName: string;
  targetSegment: string;
  segmentReason: string;
};

const CampaignSegmentResultPage = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세그먼트 결과 조회
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const res = await api.get(
          `/api/campaigns/${campaignId}/segments`
        );
        setSegments(res.data);
      } catch (e) {
        setError("세그먼트 결과를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegments();
  }, [campaignId]);

  // CSV 다운로드
  const handleDownloadCsv = async () => {
    try {
      const res = await api.get(
        `/api/campaigns/${campaignId}/segments/csv`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `customer_segments_${campaignId}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("CSV 다운로드에 실패했습니다.");
    }
  };

  // 메시지 생성 트리거
  const handleGenerateMessages = async () => {
    try {
      setIsGenerating(true);
      await api.post(`/api/campaigns/${campaignId}/messages`);
      navigate(`/campaign/${campaignId}`);
    } catch (e) {
      alert("메시지 생성 요청에 실패했습니다.");
      setIsGenerating(false);
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
      <h1>고객 타겟 그룹 매핑 결과</h1>

      <div className="segment-actions">
        <button className="csv-btn" onClick={handleDownloadCsv}>
          CSV 다운로드
        </button>
        <button
          className="generate-btn"
          onClick={handleGenerateMessages}
          disabled={isGenerating}
        >
          {isGenerating ? "메시지 생성 중..." : "메시지 생성"}
        </button>
      </div>

      <div className="segment-table-wrapper">
        <table className="segment-table">
          <thead>
            <tr>
              <th>고객 ID</th>
              <th>고객명</th>
              <th>핸드폰번호</th>
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
    </div>
  );
};

export default CampaignSegmentResultPage;
