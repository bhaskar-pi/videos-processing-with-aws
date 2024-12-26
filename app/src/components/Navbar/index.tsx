import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './index.css';
import avatar from "../../assets/avatar.png";
import { toast } from 'react-toastify';

interface NavbarProps {
  isLogin?: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Navbar: React.FC<NavbarProps> = ({ setIsLogin }) => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('userName');

  const handleAuth = () => {
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('email');
      setIsLogin(false);
      toast.info("Logout successfully.")
    } else {
      navigate('/login');
      setIsLogin(true);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-username">
          {username && (
            <img
              className="avatar"
              src={avatar}
              alt="Avatar"
            />
          )}
          {username && <p className="username-text">{username}</p>}
        </div>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <NavLink
              to="/upload"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              Upload
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink
              to="/all-videos"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              All Videos
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink
              to="/login"
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={handleAuth}
            >
              {token ? "Logout" : "Login"}
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
