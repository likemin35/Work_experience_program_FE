import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CampaignCreationPage.css";

// Type for a single custom column in the component's state
type CustomColumn = {
  key: string;
  valueType: 'single' | 'multiple';
  values: string[];
};

const CampaignCreationPage = () => {
  const [purpose, setPurpose] = useState("");
  const [coreBenefit, setCoreBenefit] = useState("");
  const [sourceUrls, setSourceUrls] = useState<string[]>([""]);
  // New state for the complex custom columns
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([
    { key: "", valueType: "single", values: [""] },
  ]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- Handlers for Source URLs ---
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...sourceUrls];
    newUrls[index] = value;
    setSourceUrls(newUrls);
  };

  const addUrlInput = () => {
    setSourceUrls([...sourceUrls, ""]);
  };

  const removeUrlInput = (index: number) => {
    if (sourceUrls.length > 1) {
      const newUrls = sourceUrls.filter((_, i) => i !== index);
      setSourceUrls(newUrls);
    }
  };

  // --- Handlers for Custom Columns ---
  const addColumn = () => {
    setCustomColumns([...customColumns, { key: "", valueType: "single", values: [""] }]);
  };

  const removeColumn = (index: number) => {
    if (customColumns.length > 1) {
      const newColumns = customColumns.filter((_, i) => i !== index);
      setCustomColumns(newColumns);
    }
  };

  const handleColumnChange = (index: number, field: keyof CustomColumn, value: any) => {
    const newColumns = [...customColumns];
    const column = newColumns[index];
    
    if (field === 'valueType') {
      column.valueType = value;
      // When switching to single, keep only the first value
      if (value === 'single') {
        column.values = [column.values[0] || ''];
      } else { // When switching to multiple, ensure there's at least one input
        if (column.values.length === 0) {
          column.values = [''];
        }
      }
    } else {
      (column as any)[field] = value;
    }
    setCustomColumns(newColumns);
  };
  
  const handleColumnValueChange = (colIndex: number, valIndex: number, value: string) => {
    const newColumns = [...customColumns];
    newColumns[colIndex].values[valIndex] = value;
    setCustomColumns(newColumns);
  };

  const addValueToColumn = (colIndex: number) => {
    const newColumns = [...customColumns];
    newColumns[colIndex].values.push("");
    setCustomColumns(newColumns);
  };

  const removeValueFromColumn = (colIndex: number, valIndex: number) => {
    const newColumns = [...customColumns];
    if (newColumns[colIndex].values.length > 1) {
      newColumns[colIndex].values = newColumns[colIndex].values.filter((_, i) => i !== valIndex);
      setCustomColumns(newColumns);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("AI Agent 구동을 요청했습니다. 잠시만 기다려주세요...");

    // 1. Filter out empty URLs
    const nonEmptyUrls = sourceUrls.filter(url => url.trim() !== "");
    
    // 2. Transform custom columns state into the required API object format
    const formattedCustomColumns: { [key: string]: string | string[] } = {};
    customColumns.forEach(col => {
      if (col.key.trim() !== "") {
        if (col.valueType === 'single') {
          // Use the single value if it's not empty
          if(col.values[0] && col.values[0].trim() !== "") {
            formattedCustomColumns[col.key.trim()] = col.values[0].trim();
          }
        } else {
          // Filter out empty strings from the multiple values array
          const nonEmptyValues = col.values.map(v => v.trim()).filter(v => v !== "");
          if (nonEmptyValues.length > 0) {
            formattedCustomColumns[col.key.trim()] = nonEmptyValues;
          }
        }
      }
    });

    const campaignData = {
      marketerId: "tester",
      purpose,
      coreBenefitText: coreBenefit,
      sourceUrls: nonEmptyUrls,
      customColumns: formattedCustomColumns,
    };

    try {
      console.log("Submitting campaign data:", campaignData);
      const response = await axios.post("/api/campaigns", campaignData);
      const newCampaignId = response.data.campaignId;
      setStatus("캠페인 생성이 완료되었습니다. 상세 페이지로 이동합니다.");
      navigate(`/campaign/${newCampaignId}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setStatus("캠페인 생성에 실패했습니다. 다시 시도해 주세요.");
      setIsLoading(false);
    }
  };

  return (
    <div className="campaign-creation-container">
      <h1>새 프로모션 생성</h1>
      <form onSubmit={handleSubmit} className="creation-form">
        {/* --- Purpose and Core Benefit (unchanged) --- */}
        <div className="form-group">
          <label htmlFor="purpose">프로모션 목적</label>
          <input type="text" id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="예: 20대 신규 고객 확보" required />
        </div>

        <hr className="section-divider" />

        <div className="form-group">
          <label htmlFor="coreBenefit">프로모션 내용 (핵심 혜택)</label>
          <textarea id="coreBenefit" value={coreBenefit} onChange={(e) => setCoreBenefit(e.target.value)} placeholder="고객에게 제공할 핵심 혜택을 상세히 설명해주세요." required />
        </div>

        <hr className="section-divider" />

        {/* --- Source URLs (unchanged) --- */}
        <div className="form-group">
          <label>참조 URL / Image</label>
          {sourceUrls.map((url, index) => (
            <div key={index} className="url-input-group">
              <input type="text" value={url} onChange={(e) => handleUrlChange(index, e.target.value)} placeholder="https://example.com/promotion_image.jpg" />
              {sourceUrls.length > 1 && (
                <button type="button" className="remove-url-btn" onClick={() => removeUrlInput(index)}>삭제</button>
              )}
            </div>
          ))}
          <button type="button" className="add-url-btn" onClick={addUrlInput}>URL 추가</button>
        </div>

        <hr className="section-divider" />

        {/* --- New Custom Columns UI --- */}
        <div className="form-group">
          <label>사용 가능한 고객 데이터 컬럼</label>
          <div className="custom-columns-table">
            {/* Header Row */}
            <div className="custom-columns-header">
              <div className="header-key">컬럼 이름 (Key)</div>
              <div className="header-type">값 유형 (Type)</div>
              <div className="header-remove">삭제</div>
            </div>

            {/* Data Rows */}
            <div className="custom-columns-body">
              {customColumns.map((col, colIndex) => (
                <div key={colIndex} className="custom-column-entry">
                  {/* Main Row for Key/Type/Remove */}
                  <div className="custom-column-main-row">
                    <div className="column-key-input">
                       <input
                        type="text"
                        value={col.key}
                        onChange={(e) => handleColumnChange(colIndex, 'key', e.target.value)}
                        placeholder={col.valueType === 'single' ? "컬럼 이름 (예: 가입일)" : "컬럼 이름 (예: 고객등급)"}
                      />
                    </div>
                    <div className="segmented-control">
                      <button type="button" className={col.valueType === 'single' ? 'active' : ''} onClick={() => handleColumnChange(colIndex, 'valueType', 'single')}>
                        서술형
                      </button>
                      <button type="button" className={col.valueType === 'multiple' ? 'active' : ''} onClick={() => handleColumnChange(colIndex, 'valueType', 'multiple')}>
                        카테고리형
                      </button>
                    </div>
                    <div className="remove-column-cell">
                      <button
                        type="button"
                        className="remove-column-btn"
                        onClick={() => removeColumn(colIndex)}
                        style={{ visibility: customColumns.length > 1 ? 'visible' : 'hidden' }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* Values Area */}
                  <div className="custom-column-values-container">
                    {col.valueType === 'single' ? (
                      <div className="custom-column-value-row">
                        <input
                          type="text"
                          value={col.values[0] || ''}
                          onChange={(e) => handleColumnValueChange(colIndex, 0, e.target.value)}
                          placeholder="설명 (예: YYYY-MM-DD 형식)"
                          className="single-value-input"
                        />
                      </div>
                    ) : (
                      <>
                        {col.values.map((val, valIndex) => (
                          <div key={valIndex} className="custom-column-value-row">
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => handleColumnValueChange(colIndex, valIndex, e.target.value)}
                              placeholder={`값 ${valIndex + 1} (예: VIP)`}
                            />
                            {col.values.length > 1 && (
                              <button type="button" className="remove-value-btn" onClick={() => removeValueFromColumn(colIndex, valIndex)}>−</button>
                            )}
                          </div>
                        ))}
                        <div className="add-value-row">
                          <button type="button" className="add-value-btn" onClick={() => addValueToColumn(colIndex)}>+</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
             <button type="button" className="add-column-btn" onClick={addColumn}>
              + 커스텀 컬럼 추가
            </button>
          </div>
        </div>

        <div className="submit-btn-container">
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "요청 처리 중..." : "AI Agent 메시지 초안 요청"}
          </button>
        </div>
      </form>
      {status && <div className="status-message">{status}</div>}
    </div>
  );
};

export default CampaignCreationPage;