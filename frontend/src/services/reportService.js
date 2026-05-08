import api from './api';

const getUsageStats = async () => {
  const response = await api.get('/reports/usage-stats');
  return response.data;
};

const getConditionSummary = async () => {
  const response = await api.get('/reports/condition-summary');
  return response.data;
};

const getAssetLifecycle = async (id) => {
  const response = await api.get(`/reports/asset-lifecycle/${id}`);
  return response.data;
};

export const reportService = {
  getUsageStats,
  getConditionSummary,
  getAssetLifecycle,
};
