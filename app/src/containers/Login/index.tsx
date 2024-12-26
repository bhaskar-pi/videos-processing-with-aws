import { useState } from 'react';
import { loginApi } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import Loading from '../../components/Loading';

interface FormData {
  email: string;
  password: string;
}

interface Props {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginForm: React.FC<Props> = ({ setIsLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { email, password } = formData;
    let isValid = true;

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

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (validate()) {
      try {
        const response = await loginApi(formData.email, formData.password);
        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', response.userName);
        localStorage.setItem('email', response.email);
        setIsLogin(true);
        toast.success('Login successful!');
        navigate('/upload')

      } catch (error: any) {
        toast.error(error.response?.data.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`login-form-page ${isLoading ? 'page-content-blur' : ''}`}>
        <div className="login-form-card-container">
          <h1 className="login-title">Welcome Back!</h1>
          <p className="login-subtitle">Login to your account</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-input-container">
              <label className="login-form-label">Email</label>
              <input
                className="login-form-input"
                type="text"
                placeholder="Enter your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="login-form-input-container">
              <label className="login-form-label">Password</label>
              <input
                className="login-form-input"
                type="password"
                placeholder="Enter your password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="login-form-button-container">
              <button type="submit" className="login-form-button">
                Login
              </button>
            </div>
            <div className="login-form-new-user-alert-container">
              <p className="new-user-alert">
                Don't have an account? 
              </p>
              <Link to="/signup" className="router-link" style={{marginTop: '18px', marginLeft: '4px'}}>
                <span className="new-user-span" style={{fontSize: '15px', fontWeight: '600'}}>Sign Up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
      {isLoading && <Loading />}
    </>
  );
};

export default LoginForm;
