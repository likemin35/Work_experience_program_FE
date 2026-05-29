import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import ktLogo from "../assets/KT_Logo.png";
import { useAuth } from "../auth/AuthContext";

const GlobalHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    closeMenu();
  }, [location]);

  return (
    <>
      <header
        className="global-header"
        style={{ backgroundColor: "#fbfbfa" }}
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
                marginTop: "10px",
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
                  marginTop: "10px",
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
            {user && (
              <li>
                <button onClick={() => void logout()}>
                  로그아웃 ({user.displayName})
                </button>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {isMenuOpen && <div className="backdrop" onClick={closeMenu} />}
    </>
  );
};

export default GlobalHeader;
