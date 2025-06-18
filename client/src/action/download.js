import axios from "axios";

export const getDownloadVideos = (userId) => async (dispatch) => {
  try {
    dispatch({ type: "FETCH_DOWNLOADS_REQUEST" });

    const { data } = await axios.get(`http://localhost:5000/api/download/downloads/${userId}`);
    
    dispatch({ type: "FETCH_DOWNLOADS_SUCCESS", payload: data });
  } catch (error) {
    dispatch({
      type: "FETCH_DOWNLOADS_FAIL",
      payload: error.response?.data?.message || error.message,
    });
  }
};
