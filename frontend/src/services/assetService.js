import api from './api';

const assetService = {
  // Get all assets
  getAllAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  // Create a new asset (Admin/Manager only)
  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData);
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
  },

  // Search/filter assets — all params optional
  // Params: { brand, model, serialNumber, status, type, assignedUserId, warrantyStatus }
  searchAssets: async (params = {}) => {
    const response = await api.get('/assets/search', { params });
    return response.data;
  },

  // Get assets by type (LAPTOP | MONITOR | ACCESSORY)
  getAssetsByType: async (type) => {
    const response = await api.get(`/assets/type/${type}`);
    return response.data;
  },

  // Get assets by status (AVAILABLE | ASSIGNED | UNDER_MAINTENANCE | DECOMMISSIONED)
  getAssetsByStatus: async (status) => {
    const response = await api.get(`/assets/status/${status}`);
    return response.data;
  },

  // Get available spare laptops
  getAvailableSpares: async () => {
    const response = await api.get('/assets/spares');
    return response.data;
  },

  // Assign an asset to a user
  assignAsset: async (allocationData) => {
    const response = await api.post('/allocations/assign', allocationData);
    return response.data;
  },

  // Return an asset (make it available again)
  returnAsset: async (returnData) => {
    const response = await api.post('/allocations/return', returnData);
    return response.data;
  },
};

export default assetService;
