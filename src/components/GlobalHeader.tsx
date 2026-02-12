import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import ktLogo from "../assets/KT_Logo.png";

const GlobalHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // 라우트 변경 시 사이드바 닫기
  useEffect(() => {
    closeMenu();
  }, [location]);

  return (
    <>
      {/* 상단 헤더 */}
      <header className="global-header"
      style={{
        backgroundColor: "#fbfbfa"
    }} 
      >
        <button
          className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to="/" className="logo-link">
        <div
            className="logo"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
            <span
            style={{
                fontSize: "14px",
                color: "#09090a",
                fontWeight: 500,
                marginTop: "10px"
            }}
            >
            with
            </span>

            <img
            src={ktLogo}
            alt="KT Logo"
            className="logo-kt-img"
            style={{ height: "20px" }}
            />
        </div>
        </Link>
      </header>

      {/* 사이드 네비 */}
      <aside className={`nav-drawer ${isMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
        <Link to="/" className="logo-link">
        <div
            className="logo"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
            <span
            style={{
                fontSize: "14px",
                color: "#09090a",
                fontWeight: 500,
                marginTop: "10px"
            }}
            >
            with
            </span>

            <img
            src={ktLogo}
            alt="KT Logo"
            className="logo-kt-img"
            style={{ height: "20px" }}
            />
        </div>
        </Link>
        </div>

        <nav className="nav-menu">
          <ul className="static-menu">
            <li>
              <NavLink to="/campaigns" onClick={closeMenu}>
                <BarChart3 size={16} style={{ marginRight: "8px" }} />
                프로모션 목록
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {isMenuOpen && <div className="backdrop" onClick={closeMenu} />}
    </>
  );
};

export default GlobalHeader;
