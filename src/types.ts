export interface GherkinStep {
  keyword: string;
  text: string;
  datatable?: string;
  comment?: string;
}

export interface SquashStep {
  id: number;
  index: number;
  _type: string;
  keyword?: string;
  action?: string;
  datatable?: string;
  comment?: string;
}

export interface Dataset {
  id: number;
  name: string;
  parameters: Array<{ id: number; name: string }>;
  parameter_values: Array<{
    parameter_id: number;
    parameter_name: string;
    parameter_value: string;
  }>;
}

export interface TestCase {
  id: number;
  name: string;
  reference: string;
  description: string;
  datasets?: Dataset[];
  parameters?: Array<{ id: number; name: string }>;
  _type?: string; // e.g., "test-case", "scripted-test-case", "keyword-test-case"
  script?: string; // Gherkin script for BDD test cases
}

export interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    stepsDeleted: number;
    stepsUpdated: number;
    stepsCreated: number;
    datasetsSynced: number;
    datasetsDeleted: number;
  };
}

// Project-related types
export interface Project {
  _type: 'project';
  id: number;
  name: string;
  label?: string;
  description?: string;
  attachments?: any[];
  _links?: {
    self?: { href: string };
    requirements?: { href: string };
    'test-cases'?: { href: string };
    campaigns?: { href: string };
    clearances?: { href: string };
    attachments?: { href: string };
  };
}

export interface ProjectTemplate {
  _type: 'project-template';
  id: number;
  name: string;
  label?: string;
  description?: string;
  attachments?: any[];
  _links?: {
    self?: { href: string };
    requirements?: { href: string };
    'test-cases'?: { href: string };
    campaigns?: { href: string };
  };
}

export interface CreateProjectParams {
  name: string;
  label?: string;
  description?: string;
}

export interface ProjectTemplateParams {
  copy_permissions?: boolean;
  copy_cuf?: boolean;
  copy_bugtracker_binding?: boolean;
  copy_ai_server_binding?: boolean;
  copy_automated_projects?: boolean;
  copy_infolists?: boolean;
  copy_milestone?: boolean;
  copy_allow_tc_modif_from_exec?: boolean;
  copy_optional_exec_statuses?: boolean;
  copy_plugins_activation?: boolean;
  keep_template_binding?: boolean;
  copy_plugins_configuration?: boolean;
  keep_plugins_binding?: boolean;
}

export interface CreateProjectFromTemplateParams extends CreateProjectParams {
  template_id: number;
  params?: ProjectTemplateParams;
}

export interface CreateTemplateParams {
  name: string;
  label?: string;
  description?: string;
}

export interface TemplateFromProjectParams {
  copy_permissions?: boolean;
  copy_cuf?: boolean;
  copy_bugtracker_binding?: boolean;
  copy_automated_projects?: boolean;
  copy_ai_server_binding?: boolean;
  copy_optional_exec_statuses?: boolean;
  copy_plugins_activation?: boolean;
  copy_infolists?: boolean;
  copy_milestone?: boolean;
  copy_allow_tc_modif_from_exec?: boolean;
  copy_plugins_configuration?: boolean;
}

export interface CreateTemplateFromProjectParams extends CreateTemplateParams {
  project_id: number;
  params?: TemplateFromProjectParams;
}

export interface Profile {
  _type: 'profile';
  id: number;
  name: string;
  type: 'system' | 'custom';
  users?: Array<User | Team>;
}

export interface User {
  _type: 'user';
  id: number;
  login: string;
  _links?: {
    self?: { href: string };
  };
}

export interface Team {
  _type: 'team';
  id: number;
  name: string;
  _links?: {
    self?: { href: string };
  };
}

export interface ProjectClearances {
  content: {
    [profileKey: string]: Profile;
  };
  _links?: {
    self?: { href: string };
  };
}

export interface PagedResponse {
  _embedded: {
    projects?: Project[];
    'project-templates'?: ProjectTemplate[];
  };
  _links?: {
    first?: { href: string };
    prev?: { href: string };
    self?: { href: string };
    next?: { href: string };
    last?: { href: string };
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Test Case types
export interface CreateKeywordTestCaseParams {
  name: string;
  parent: {
    _type: 'project' | 'test-case-folder';
    id: number;
  };
  description?: string;
  prerequisite?: string;
  importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  status?: 'WORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';
  automated_test_technology?: string; // e.g., 'Playwright', 'Selenium', etc.
}

// BDD Test Case types
export interface CreateBDDTestCaseParams {
  name: string;
  parent: {
    _type: 'project' | 'test-case-folder';
    id: number;
  };
  script: string; // Gherkin content
  description?: string;
  prerequisite?: string;
  importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  status?: 'WORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';
  nature?: { code: string };
  type?: { code: string };
}

export interface UpdateBDDTestCaseParams {
  script?: string;
  name?: string;
  description?: string;
  prerequisite?: string;
  importance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  status?: 'WORK_IN_PROGRESS' | 'UNDER_REVIEW' | 'APPROVED' | 'OBSOLETE';
}

export interface AddStepParams {
  testCaseId: number;
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text: string;
  position?: 'end' | number; // 'end' or specific index
}

export interface UpdateStepParams {
  testCaseId: number;
  stepIndex: number; // 0-based index in the Gherkin script
  keyword?: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text?: string;
}
