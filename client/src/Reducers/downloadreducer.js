const initialState = {
  downloads: [],
  loading: false,
  error: null,
};

const downloadreducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_DOWNLOADS_REQUEST":
      return { ...state, loading: true };
    case "FETCH_DOWNLOADS_SUCCESS":
      return { ...state, downloads: action.payload, loading: false };
    case "FETCH_DOWNLOADS_FAIL":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export default downloadreducer;
