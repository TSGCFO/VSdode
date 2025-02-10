import { rulesApi, customerServiceApi, handleApiError } from '../utils/apiClient';

const rulesService = {
  // Rule Groups
  getRuleGroups: async () => {
    try {
      console.log('Fetching rule groups...');
      const data = await rulesApi.listGroups();
      console.log('Rule groups data:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching rule groups:', error);
      throw handleApiError(error);
    }
  },

  getRuleGroup: async (id) => {
    try {
      return await rulesApi.getGroup(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createRuleGroup: async (data) => {
    try {
      // Extract just the customer_service ID and logic_operator
      const payload = {
        customer_service: data.customer_service,
        logic_operator: data.logic_operator
      };
      return await rulesApi.createGroup(payload);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateRuleGroup: async (id, data) => {
    try {
      return await rulesApi.updateGroup(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteRuleGroup: async (id) => {
    try {
      await rulesApi.deleteGroup(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Basic Rules
  getRules: async (groupId) => {
    try {
      return await rulesApi.listRules(groupId);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createRule: async (groupId, data) => {
    try {
      return await rulesApi.createRule(groupId, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateRule: async (id, data) => {
    try {
      return await rulesApi.updateRule(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteRule: async (id) => {
    try {
      await rulesApi.deleteRule(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Advanced Rules
  getAdvancedRules: async (groupId) => {
    try {
      return await rulesApi.listAdvancedRules(groupId);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createAdvancedRule: async (groupId, data) => {
    try {
      return await rulesApi.createAdvancedRule(groupId, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateAdvancedRule: async (id, data) => {
    try {
      return await rulesApi.updateAdvancedRule(id, data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteAdvancedRule: async (id) => {
    try {
      await rulesApi.deleteAdvancedRule(id);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Utility Endpoints
  getOperatorChoices: async (field) => {
    try {
      return await rulesApi.getOperatorChoices(field);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  validateConditions: async (conditions) => {
    try {
      return await rulesApi.validateConditions(conditions);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  validateCalculations: async (calculations) => {
    try {
      return await rulesApi.validateCalculations(calculations);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getConditionsSchema: async () => {
    try {
      return await rulesApi.getConditionsSchema();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCalculationsSchema: async () => {
    try {
      return await rulesApi.getCalculationsSchema();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAvailableFields: async () => {
    try {
      return await rulesApi.getAvailableFields();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCalculationTypes: async () => {
    try {
      return await rulesApi.getCalculationTypes();
    } catch (error) {
      throw handleApiError(error);
    }
  },

  validateRuleValue: async (data) => {
    try {
      return await rulesApi.validateRuleValue(data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getCustomerSkus: async (groupId) => {
    try {
      return await rulesApi.getCustomerSkus(groupId);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Customer Services
  getCustomerServices: async () => {
    try {
      console.log('Fetching customer services...');
      const services = await customerServiceApi.list();
      console.log('Customer services response:', services);
      return services;
    } catch (error) {
      console.error('Error in getCustomerServices:', error);
      throw handleApiError(error);
    }
  }
};

export default rulesService;