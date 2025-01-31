// Rule Types
export type FieldType = 'string' | 'number' | 'sku';

export type Operator = 
  | 'eq' | 'ne'  // Equality
  | 'gt' | 'lt'  // Comparison
  | 'ge' | 'le'  // Comparison with equality
  | 'in' | 'ni'  // List inclusion
  | 'contains' | 'ncontains'  // String contains
  | 'startswith' | 'endswith'  // String position
  | 'only_contains';  // SKU specific

export type LogicOperator = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

export type CalculationType = 
  | 'flat_fee'
  | 'percentage'
  | 'per_unit'
  | 'weight_based'
  | 'volume_based'
  | 'tiered_percentage'
  | 'product_specific';

// Base Interfaces
export interface Rule {
  id?: string;
  field: string;
  operator: Operator;
  value: string;
  adjustment_amount?: number;
}

export interface RuleGroup {
  id?: string;
  customer_service?: number;
  logic_operator: LogicOperator;
  rules: Rule[];
}

export interface AdvancedRule extends Rule {
  conditions: Record<string, Record<string, string>>;
  calculations: Calculation[];
}

export interface Calculation {
  type: CalculationType;
  value: number;
  tiers?: TierConfig[];
  rates?: Record<string, number>;
}

export interface TierConfig {
  min: number;
  max: number;
  percentage: number;
}

// Result Types
export interface RuleResult {
  success: boolean;
  reason: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Context Types
export interface ValidationContext {
  [key: string]: any;
}

// UI Types
export interface RuleFormState {
  field: string;
  operator: Operator;
  value: string;
  adjustment_amount?: string;
}

export interface RuleBuilderState {
  conditions: Rule[];
  calculations: Calculation[];
}

// Field Options
export interface FieldOption {
  value: string;
  label: string;
  type: FieldType;
}

export interface OperatorOption {
  value: Operator;
  label: string;
}

export interface CalculationTypeOption {
  value: CalculationType;
  label: string;
  description: string;
}

// Component Props
export interface RuleComponentProps {
  rule: Rule;
  onUpdate: (rule: Rule) => void;
  onDelete: (id: string) => void;
}

export interface RuleGroupComponentProps {
  group: RuleGroup;
  onUpdate: (group: RuleGroup) => void;
  onDelete: (id: string) => void;
}

export interface RuleBuilderProps {
  initialRule?: Rule;
  onSave: (rule: Rule) => void;
  onClose: () => void;
}

export interface RulePreviewProps {
  rule: Rule;
  testData?: ValidationContext;
  onClose: () => void;
}

// History Types
export interface HistoryEntry {
  timestamp: number;
  rule: Rule;
  action: 'create' | 'update' | 'delete';
}

export interface HistoryState {
  past: HistoryEntry[];
  present: HistoryEntry | null;
  future: HistoryEntry[];
}