import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { confirmSignUpApi } from "../../services/api";

const ConfirmSignUp = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const validate = () => {
    if (!code) {
      setErrorMessage("Code is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const email = localStorage.getItem('otpEmail') || ''
    console.log({email})
    e.preventDefault();
    if (validate()) {
      try {
        const response = await confirmSignUpApi(email, code);
        setErrorMessage(null);
        console.log('Confirmation successful:', response);
        navigate('/login');
      } catch (error: any) {
        setErrorMessage(error.response?.data.message || 'An error occurred');
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-page-card-container">
        <h1>Enter Code</h1>
        <form onSubmit={handleSubmit}>
          <div className="register-form-input-container">
            <label className="register-form-label">Code</label>
            <input
              className="register-form-input"
              type="text"
              placeholder="782671"
              name="code"
              value={code} 
              onChange={handleChange} 
            />
            {errorMessage && <span className="error">{errorMessage}</span>}
          </div>
          <div className="register-form-button-container">
            <button type="submit" className="register-form-button">
              Confirm Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfirmSignUp;
