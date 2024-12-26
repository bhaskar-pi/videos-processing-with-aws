import { useState } from 'react';
import axios from 'axios';
import './index.css';
import Loading from '../../components/Loading';
import uploadImage from '../../assets/upload-video.svg'; // Ensure correct path for the image
import { toast } from 'react-toastify';

const UploadVideo = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  console.log({file, title, description})

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !title || !description) {
      alert('Please provide all required details.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    const uploadedBy = localStorage.getItem('userId') || '';
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('uploadedBy', uploadedBy);
    const token = localStorage.getItem('token') || '';

    console.log(formData)
    try {
      await axios.post('http://localhost:5003/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      toast.success('Video uploaded successfully!');
      setFile(null);
      setTitle('');
      setDescription('');
      setIsLoading(false);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Video not uploaded, try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />} 
      <div className={`upload-video-page ${isLoading ? 'page-content-blur' : ''}`}>
        <div className="upload-container">
          {/* Left Side - Image */}
          <div className="upload-image-container">
            <img src={uploadImage} alt="Upload Video" className="upload-image" />
          </div>

          {/* Right Side - Form */}
          <div className="upload-form-container">
            <h1 className="upload-title">Upload Your Video</h1>
            <form className="upload-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="file-upload">Choose Video File</label>
                <input
                  id="file-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  required
                  className="file-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description"
                  required
                  className="textarea-field"
                />
              </div>
              <button type="submit" className="upload-button">
                Upload Video
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadVideo;
