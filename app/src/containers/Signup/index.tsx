import { useState } from "react";
import { TbExternalLink } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";  // Import toastify
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { signUpApi } from "../../services/api"; // Assuming you have a register API
import Loading from "../../components/Loading";
import "./index.css";

interface FormData {
  username: string;
  email: string;
  password: string;
}

interface FormErrors {
  username: string;
  email: string;
  password: string;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { username, email, password } = formData;
    let isValid = true;
    const errors: Partial<FormErrors> = {};

    if (!username) {
      toast.error('Username is required');
      isValid = false;
    }

    if (!email) {
      toast.error('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Invalid email address');
      isValid = false;
    }

    if (!password) {
      toast.error('Password is required');
      isValid = false;
    }

    setErrors(errors as FormErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (validate()) {
      try {
        const response = await signUpApi(formData.username, formData.email, formData.password);
        toast.success('Registration successful!');
        localStorage.setItem('otpEmail', response.email);
        setLoading(false);
        navigate(`/confirm-signup`);
      } catch (error: any) {
        toast.error(error.response?.data.message || 'An error occurred');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`register-page ${loading ? 'page-content-blur' : ''}`}>
        <div className="register-page-card-container">
          <h1 className="register-title">Join Us Today!</h1>
          <p className="register-subtitle">Create an account to upload and manage your videos, adjust resolutions, and more!</p>
          <form onSubmit={handleSubmit}>
            <div className="register-form-input-container">
              <label className="register-form-label">Username</label>
              <input
                className="register-form-input"
                type="text"
                placeholder="Enter your username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-input-container">
              <label className="register-form-label">Email</label>
              <input
                className="register-form-input"
                type="text"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-input-container">
              <label className="register-form-label">Password</label>
              <input
                className="register-form-input"
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="register-form-button-container">
              <button type="submit" className="register-form-button">
                Sign Up
              </button>
            </div>

            <div className="already-user-alert-container">
              <p className="already-user-alert">
                Already have an account?
              </p>
              <Link to="/login" className="router-link">
                <span className="already-user-span" style={{fontSize: '15px', marginLeft: '4px', fontWeight: '600'}}>Login</span>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {loading && <Loading />}

    </>
  );
};

export default RegisterForm;
