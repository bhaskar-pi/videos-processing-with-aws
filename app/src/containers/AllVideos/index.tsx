import { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';
import { ClipLoader } from 'react-spinners';
import Loading from '../../components/Loading';
import { toast } from 'react-toastify';
import { deleteVideoApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface AllVideosProps {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AllVideos: React.FC<AllVideosProps> = ({ setIsLogin }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [videoUrls, setVideoUrls] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [videosLoading, setVideosLoading] = useState(false);
  const [preSignedUrls, setPreSignedUrls] = useState<any>({});
  const navigate = useNavigate()

  useEffect(() => {
    const fetchVideosWithPreSignedUrls = async () => {
      const token = localStorage.getItem('token');
      setVideosLoading(true);
      try {
        const response = await axios.get('http://localhost:5003/api/videos/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.videos.length === 0) {
          toast.info('No videos available!');
        }

        setVideos(response.data.videos);
        setPreSignedUrls(response.data.preSignedUrls);

        const initialUrls = response.data.videos.reduce((acc: any, video: any) => {
          acc[video.videoId] = video.s3Url;
          return acc;
        }, {});
        setVideoUrls(initialUrls);

        setVideosLoading(false);
      } catch (err: any) {
        toast.error(err.response.data.message);
        if (err.response.status === 401){
          navigate('/login')
          setIsLogin(false)
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          localStorage.removeItem('email');
        }
        setVideosLoading(false);
      }
    };

    fetchVideosWithPreSignedUrls();
  }, []);

  const handleResolutionChange = async (videoId: string, fileName: string, resolution: string) => {
    setLoading((prevLoading) => ({
      ...prevLoading,
      [videoId]: true,
    }));

    const token = localStorage.getItem('token');
    const newUrl = preSignedUrls[fileName][resolution];

    if (newUrl) {
      setVideoUrls((prevUrls) => ({
        ...prevUrls,
        [videoId]: newUrl,
      }));
      setLoading((prevLoading) => ({
        ...prevLoading,
        [videoId]: false,
      }));
    } else {
      try {
        const response = await axios.post(
          'http://localhost:5004/api/videos/update-resolution',
          { fileName, resolution },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVideoUrls((prevUrls) => ({
          ...prevUrls,
          [videoId]: `${response.data.url}`,
        }));
      } catch (error) {
        toast.error('Failed to update video resolution.');
      } finally {
        setLoading((prevLoading) => ({
          ...prevLoading,
          [videoId]: false,
        }));
      }
    }
  };

  const deleteVideo = async(fileName: string, videoId: string) => {
    if (fileName){
      setVideosLoading(true)
      try {
        const userEmail = localStorage.getItem('email') || ''
        const token = localStorage.getItem('token')
        console.log({userEmail})
        const deleteVideoResponse = await deleteVideoApi(fileName, userEmail, token)
        if (deleteVideoResponse.status === 200){
          setVideos((prevVideos) => prevVideos.filter((video) => video.videoId !== videoId));
          setVideosLoading(false)
          toast.success(deleteVideoResponse.data.message)
          return
        }

        setVideosLoading(false)
        toast.error(deleteVideoResponse.data.message || "Video not deleted try again !")

      } catch (error:any) {
        setVideosLoading(false)
        toast.error(error?.data?.message || "Video not deleted try again !")
      }
    }
  }

  return (
    <>
      {videosLoading && <Loading />} {/* Loading with blur effect */}
      <div className={`videos-container ${videosLoading ? 'page-content-blur' : ''}`}>
        <h1 className="page-title">All Videos</h1>
        <div className="videos-list">
          {videos.length > 0 ? (
            videos.map((video) => {
              return (
                <div key={video.videoId} className="video-item">
                  <div className="video-thumbnail-container">
                    {/* Video Thumbnail */}
                    {loading[video.videoId] ? (
                      <div className="loading-container">
                        <ClipLoader color="#36d7b7" loading={loading[video.videoId]} size={50} />
                      </div>
                    ) : (
                      <video controls src={videoUrls[video.videoId]} className="video-thumbnail">
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>

                  {/* Right Side - Details */}
                  <div className="video-details">
                    <h2 className="video-title">{video.title}</h2>
                    <p className="video-description">{video.description}</p>
                    <p className="upload-date">Uploaded on: {new Date(video.uploadDate).toLocaleDateString()}</p>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <div className="resolution-selector">
                        <label htmlFor={`resolution-${video.videoId}`}>Resolution:</label>
                        <select
                          id={`resolution-${video.videoId}`}
                          onChange={(e) => handleResolutionChange(video.videoId, video.fileName, e.target.value)}
                          defaultValue="select..."
                        >
                          <option disabled>select...</option>
                          <option value="360p">360p</option>
                          <option value="480p">480p</option>
                          <option value="720p">720p</option>
                          <option value="1080p">1080p</option>
                        </select>
                      </div>
                      <button
                        className="delete-button"
                        style={{marginTop: '10px'}}
                        onClick={() => deleteVideo(video.fileName, video.videoId)}
                      >
                        Delete Video
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No videos available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AllVideos;
