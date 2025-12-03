import React, { useState } from 'react';
import './AiValidatorReport.css';

interface ValidatorReport {
  spam_risk_score: number;
  policy_compliance: 'PASS' | 'FAIL';
  review_summary: string;
  recommended_action: string;
}

interface AiValidatorReportProps {
  report: ValidatorReport;
}

const AiValidatorReport: React.FC<AiValidatorReportProps> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="validator-report">
      <div className="report-title">AI Validator Report</div>
      <div className="report-item">
        <span>정책 준수:</span>
        <span className={`value ${report.policy_compliance === 'PASS' ? 'safe' : ''}`}>
          {report.policy_compliance}
        </span>
      </div>
      <div className="report-item">
        <span>스팸 위험도:</span>
        <span className="value">{report.spam_risk_score}%</span>
      </div>

      {isExpanded && (
        <div className="report-details-expanded">
          <div className="report-item block-layout">
            <strong>검토 요약:</strong>
            <span>{report.review_summary}</span>
          </div>
          <div className="report-item block-layout">
            <strong>권장 조치:</strong>
            <span>{report.recommended_action}</span>
          </div>
        </div>
      )}

      <button className="details-toggle-button" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '상세 분석 닫기 ▲' : '상세 분석 보기 ▼'}
      </button>
    </div>
  );
};

export default AiValidatorReport;
