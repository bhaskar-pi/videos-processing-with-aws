import { useEffect, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AllVideos from './containers/AllVideos';
import LoginForm from './containers/Login';
import UploadVideo from './containers/UploadVideo';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Signup from './containers/Signup';
import ConfirmSignUp from './containers/ConfirmSignUp';
import { ToastContainer } from 'react-toastify';

function App() {
  const token = localStorage.getItem('token');
  const [isLogin, setIsLogin] = useState(!!token); 

  console.log({token})

  useEffect(() => {
    setIsLogin(!!token);
  }, [token, setIsLogin, localStorage]);

  return (
    <Router>
      <div>
        <ToastContainer />
        {isLogin && <Navbar isLogin={isLogin} setIsLogin={setIsLogin} />}
        <Routes>
        <Route path='/login' element={<LoginForm setIsLogin={setIsLogin} />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/confirm-signup' element={<ConfirmSignUp />} />
        <Route path='/upload' element={<ProtectedRoute element={<UploadVideo />} />} />
        <Route path='all-videos' element={<ProtectedRoute element={<AllVideos setIsLogin={setIsLogin} />} />} />   
        <Route path='/' element={<Navigate to={token ? '/upload' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
