import axios from 'axios';

const RULES_BASE_URL = '/rules';
const API_BASE_URL = '/api/v1';

const rulesService = {
  // Rule Groups
  getRuleGroups: async () => {
    try {
      const response = await axios.get(`${RULES_BASE_URL}/api/groups/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching rule groups:', error);
      return [];
    }
  },

  getRuleGroup: async (id) => {
    if (!id) throw new Error('Rule group ID is required');
    const response = await axios.get(`${RULES_BASE_URL}/group/${id}/`);
    return response.data;
  },

  createRuleGroup: async (data) => {
    const response = await axios.post(`${RULES_BASE_URL}/api/groups/`, data);
    return response.data;
  },

  updateRuleGroup: async (id, data) => {
    if (!id) throw new Error('Rule group ID is required');
    const response = await axios.put(`${RULES_BASE_URL}/group/${id}/edit/`, data);
    return response.data;
  },

  deleteRuleGroup: async (id) => {
    if (!id) throw new Error('Rule group ID is required');
    await axios.delete(`${RULES_BASE_URL}/group/${id}/delete/`);
  },

  // Basic Rules
  getRules: async (groupId) => {
    const response = await axios.get(RULES_BASE_URL, {
      params: { group_id: groupId }
    });
    return response.data;
  },

  createRule: async (groupId, data) => {
    if (!groupId) throw new Error('Group ID is required');
    const response = await axios.post(`${RULES_BASE_URL}/group/${groupId}/rule/create/`, data);
    return response.data;
  },

  updateRule: async (id, data) => {
    if (!id) throw new Error('Rule ID is required');
    const response = await axios.put(`${RULES_BASE_URL}/rule/${id}/edit/`, data);
    return response.data;
  },

  deleteRule: async (id) => {
    if (!id) throw new Error('Rule ID is required');
    await axios.delete(`${RULES_BASE_URL}/rule/${id}/delete/`);
  },

  // Advanced Rules
  getAdvancedRules: async (groupId) => {
    const response = await axios.get(RULES_BASE_URL, {
      params: { group_id: groupId, type: 'advanced' }
    });
    return response.data;
  },

  createAdvancedRule: async (groupId, data) => {
    if (!groupId) throw new Error('Group ID is required');
    const response = await axios.post(`${RULES_BASE_URL}/group/${groupId}/advanced-rule/create/`, data);
    return response.data;
  },

  updateAdvancedRule: async (id, data) => {
    if (!id) throw new Error('Rule ID is required');
    const response = await axios.put(`${RULES_BASE_URL}/advanced-rule/${id}/edit/`, data);
    return response.data;
  },

  deleteAdvancedRule: async (id) => {
    if (!id) throw new Error('Rule ID is required');
    await axios.delete(`${RULES_BASE_URL}/advanced-rule/${id}/delete/`);
  },

  // Utility Endpoints
  getOperatorChoices: async (field) => {
    if (!field) throw new Error('Field is required');
    const response = await axios.get(`${RULES_BASE_URL}/operators/`, {
      params: { field }
    });
    return response.data.operators;
  },

  validateConditions: async (conditions) => {
    const response = await axios.post(`${RULES_BASE_URL}/validate-conditions/`, { conditions });
    return response.data;
  },

  validateCalculations: async (calculations) => {
    const response = await axios.post(`${RULES_BASE_URL}/validate-calculations/`, { calculations });
    return response.data;
  },

  getConditionsSchema: async () => {
    const response = await axios.get(`${RULES_BASE_URL}/conditions-schema/`);
    return response.data;
  },

  getCalculationsSchema: async () => {
    const response = await axios.get(`${RULES_BASE_URL}/calculations-schema/`);
    return response.data;
  },

  getAvailableFields: async () => {
    const response = await axios.get(`${RULES_BASE_URL}/fields/`);
    return response.data;
  },

  getCalculationTypes: async () => {
    const response = await axios.get(`${RULES_BASE_URL}/calculation-types/`);
    return response.data;
  },

  validateRuleValue: async (data) => {
    const response = await axios.post(`${RULES_BASE_URL}/validate-rule-value/`, data);
    return response.data;
  },

  getCustomerSkus: async (groupId) => {
    if (!groupId) throw new Error('Group ID is required');
    const response = await axios.get(`${RULES_BASE_URL}/group/${groupId}/skus/`);
    return response.data;
  },

  // Customer Services
  getCustomerServices: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/customer-services/`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching customer services:', error);
      throw error;
    }
  }
};

export default rulesService;