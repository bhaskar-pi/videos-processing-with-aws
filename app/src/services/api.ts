import axios from 'axios';


export const uploadVideoApi = (formData: FormData) => {
  const token = localStorage.getItem('token') || '';
  return axios.post('http://localhost:5003/api/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    }
  });
};

export const deleteVideoApi = (fileName: string, userEmail: string, token: string ) => {
  return axios.delete('http://localhost:5003/api/videos/delete', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      fileName, userEmail
    }
  });
};


export const loginApi = (email: string, password: string) => {
  console.log({email, password})
  return axios.post('http://localhost:5001/api/login', { email, password })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
};

export const signUpApi = (name: string, email: string, password: string) => {
  return axios.post('http://localhost:5002/api/signup', { email,name, password })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
}

export const confirmSignUpApi = (email: string, code: string) => {
  return axios.post('http://localhost:5002/api/confirm-signup', {email, code })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      throw error;
    });
}