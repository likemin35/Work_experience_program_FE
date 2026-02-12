import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./CampaignCreationPage.css";
import { FileText, FileSpreadsheet } from "lucide-react";

const CampaignCreationPage = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isPdfDragging, setIsPdfDragging] = useState(false);
  const [isCsvDragging, setIsCsvDragging] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile) {
      setStatus("프로모션 PDF 파일을 업로드해주세요.");
      return;
    }

    if (!csvFile) {
      setStatus("고객 CSV 파일을 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setStatus("캠페인 생성 및 고객 세그먼트 매핑을 진행 중입니다...");

    try {
      const campaignFormData = new FormData();
      campaignFormData.append("file", pdfFile);

      const campaignRes = await api.post(
        "/api/campaigns",
        campaignFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const campaignId = campaignRes.data.campaignId;

      const customerFormData = new FormData();
      customerFormData.append("file", csvFile);

      await api.post(
        `/api/campaigns/${campaignId}/segments`,
        customerFormData
      );

      navigate(`/campaign/${campaignId}/segments`);
    } catch (error) {
      setStatus("처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  const handlePdfDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsPdfDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleCsvDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsCsvDragging(false);
    if (e.dataTransfer.files?.[0]) {
      setCsvFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="campaign-creation-container">
      <div className="creation-content">
        <span className="page-label">NEW CAMPAIGN</span>
        <h1 className="page-title">새 프로모션 생성</h1>

        <form onSubmit={handleSubmit} className="creation-form">

          <div className="upload-grid">

            {/* PDF */}
            <div className="upload-card">
              <div className="upload-card-header">
                <FileText size={22} color="#ef4444" />
                <div>
                  <h3>프로모션 PDF 업로드</h3>
                  <p>파일을 선택하거나 드래그하여 업로드하세요</p>
                </div>
              </div>

              <label
                className={`drop-zone ${isPdfDragging ? "dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsPdfDragging(true);
                }}
                onDragLeave={() => setIsPdfDragging(false)}
                onDrop={handlePdfDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setPdfFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="drop-content">
                  <p>Choose a file or drag & drop it here</p>
                  <span className="browse-btn">Browse File</span>
                </div>
              </label>

              {pdfFile && (
                <div className="file-preview">
                  <div className="file-badge-pdf">PDF</div>
                  <div className="file-info">
                    <span>{pdfFile.name}</span>
                    <span className="file-status">업로드 준비 완료</span>
                  </div>
                </div>
              )}
            </div>

            {/* CSV */}
            <div className="upload-card">
              <div className="upload-card-header">
                <FileSpreadsheet size={22} color="#16a34a" />
                <div>
                  <h3>고객 CSV 업로드</h3>
                  <p>파일을 선택하거나 드래그하여 업로드하세요</p>
                </div>
              </div>

              <label
                className={`drop-zone ${isCsvDragging ? "dragging" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsCsvDragging(true);
                }}
                onDragLeave={() => setIsCsvDragging(false)}
                onDrop={handleCsvDrop}
              >
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setCsvFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="drop-content">
                  <p>Choose a file or drag & drop it here</p>
                  <span className="browse-btn">Browse File</span>
                </div>
              </label>

              {csvFile && (
                <div className="file-preview">
                  <div className="file-badge-csv">CSV</div>
                  <div className="file-info">
                    <span>{csvFile.name}</span>
                    <span className="file-status">업로드 준비 완료</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "고객 세그먼트 매핑 시작"}
          </button>

        </form>

        {status && <div className="status-message">{status}</div>}
      </div>
    </div>
  );
};

export default CampaignCreationPage;
