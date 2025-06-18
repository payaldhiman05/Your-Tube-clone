import React, { useEffect } from 'react';
import './ProfilePage.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setcurrentuser } from '../../action/currentuser';
import { login } from '../../action/auth';
import { googleLogout } from '@react-oauth/google';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.currentuserreducer?.result);

   useEffect(() => {
  const localUser = JSON.parse(localStorage.getItem('Profile'));
  if (localUser?.result && !user) {
    dispatch(login(localUser));
  }
}, [dispatch, user]);

  const handleLogout = () => {
    dispatch(setcurrentuser(null));
    googleLogout();
    localStorage.clear();
    navigate('/');
  };

  const handleUpgrade = () => {
    navigate('/premium');
  };

  console.log("User in ProfilePage:", user);

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      <div className="profile-info">
        <div><strong>Name:</strong> {user?.name || 'N/A'}</div>
        <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
        <div><strong>Joined:</strong> {user?.joinedon || 'Unknown'}</div>
        <div><strong>Status:</strong> {user?.isPremium ? 'Premium User' : 'Free User'}</div>
        <div><strong>Points:</strong> {user?.points || 0}</div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
        {!user?.isPremium && (
          <button className="upgrade-button" onClick={handleUpgrade}>
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
