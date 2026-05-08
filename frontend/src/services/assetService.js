import api from './api';

const assetService = {
  // Get all assets
  getAllAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  // Get assets assigned to the current user
  getMyAssets: async () => {
    const response = await api.get('/assets/my');
    return response.data;
  },

  // Get a single asset by ID
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // Create a condition report
  createConditionReport: async (reportData) => {
    const response = await api.post('/allocations/condition-report', reportData);
    return response.data;
  },

  // Get condition reports for a specific asset
  getReportsByAsset: async (assetId) => {
    const response = await api.get(`/allocations/condition-report/asset/${assetId}`);
    return response.data;
  },

  // Get my condition reports
  getMyConditionReports: async () => {
    const response = await api.get('/allocations/condition-report/my');
    return response.data;
  }
};

export default assetService;
