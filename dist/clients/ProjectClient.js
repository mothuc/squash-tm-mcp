import { BaseClient } from './BaseClient.js';
/**
 * Client for Squash TM Projects API operations.
 * Handles project and project template management, including creation, retrieval, and clearances.
 *
 * @extends BaseClient
 */
export class ProjectClient extends BaseClient {
    /**
     * Get all projects (both standard and template) that the user is allowed to read.
     *
     * @param options - Query options
     * @param options.page - Page number (default: 0)
     * @param options.size - Page size (default: 20)
     * @param options.type - Filter by type: 'STANDARD', 'TEMPLATE', or undefined for all
     * @param options.milestoneId - Filter by milestone ID
     * @param options.milestoneLabel - Filter by milestone label
     * @param options.fields - Which fields to return
     * @returns Paged response with projects and/or project templates
     *
     * @example
     * // Get all projects
     * const allProjects = await client.getAllProjects();
     *
     * // Get only standard projects
     * const standardProjects = await client.getAllProjects({ type: 'STANDARD' });
     *
     * // Get projects filtered by milestone
     * const milestoneProjects = await client.getAllProjects({ milestoneId: 123 });
     */
    async getAllProjects(options = {}) {
        const params = new URLSearchParams();
        if (options.page !== undefined)
            params.append('page', options.page.toString());
        if (options.size !== undefined)
            params.append('size', options.size.toString());
        if (options.type)
            params.append('type', options.type);
        if (options.milestoneId !== undefined)
            params.append('milestoneId', options.milestoneId.toString());
        if (options.milestoneLabel)
            params.append('milestoneLabel', options.milestoneLabel);
        if (options.fields)
            params.append('fields', options.fields);
        const queryString = params.toString();
        const url = queryString ? `${this.baseURL}/projects?${queryString}` : `${this.baseURL}/projects`;
        const response = await this.makeRequest(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Get a specific project by ID (requires administrator privileges).
     *
     * @param projectId - The ID of the project
     * @param fields - Optional fields to return
     * @returns The project details
     *
     * @example
     * const project = await client.getProject(367);
     */
    async getProject(projectId, fields) {
        const params = fields ? `?fields=${fields}` : '';
        const response = await this.makeRequest(`${this.baseURL}/projects/${projectId}${params}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch project: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Get a project by name (requires administrator privileges).
     * Note: Both the parameter name 'projectName' and its value are case-sensitive.
     *
     * @param projectName - The name of the project (case-sensitive)
     * @param fields - Optional fields to return
     * @returns The project details
     *
     * @example
     * const project = await client.getProjectByName('sample project');
     */
    async getProjectByName(projectName, fields) {
        const params = new URLSearchParams({ projectName });
        if (fields)
            params.append('fields', fields);
        const response = await this.makeRequest(`${this.baseURL}/projects?${params.toString()}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch project by name: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Create a new standard project.
     *
     * @param params - Project creation parameters
     * @returns The created project
     *
     * @example
     * const newProject = await client.createProject({
     *   name: 'My New Project',
     *   label: 'Project Label',
     *   description: '<p>Project description</p>'
     * });
     */
    async createProject(params) {
        const body = {
            _type: 'project',
            name: params.name,
            label: params.label,
            description: params.description
        };
        const response = await this.makeRequest(`${this.baseURL}/projects`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create project: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Create a new project from a template.
     *
     * @param params - Project creation parameters including template ID and copy options
     * @returns The created project
     *
     * @example
     * const newProject = await client.createProjectFromTemplate({
     *   name: 'My New Project',
     *   label: 'Project Label',
     *   description: '<p>Project description</p>',
     *   template_id: 23,
     *   params: {
     *     copy_permissions: true,
     *     copy_cuf: true,
     *     copy_bugtracker_binding: true
     *   }
     * });
     */
    async createProjectFromTemplate(params) {
        const body = {
            _type: 'project',
            name: params.name,
            label: params.label,
            description: params.description,
            template_id: params.template_id,
            params: params.params
        };
        const response = await this.makeRequest(`${this.baseURL}/projects`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create project from template: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Create a new project template.
     *
     * @param params - Template creation parameters
     * @returns The created project template
     *
     * @example
     * const newTemplate = await client.createProjectTemplate({
     *   name: 'My Template',
     *   label: 'Template Label',
     *   description: '<p>Template description</p>'
     * });
     */
    async createProjectTemplate(params) {
        const body = {
            _type: 'project-template',
            name: params.name,
            label: params.label,
            description: params.description
        };
        const response = await this.makeRequest(`${this.baseURL}/projects`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create project template: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Create a new project template from an existing project.
     *
     * @param params - Template creation parameters including source project ID and copy options
     * @returns The created project template
     *
     * @example
     * const newTemplate = await client.createTemplateFromProject({
     *   name: 'My Template',
     *   label: 'Template Label',
     *   description: '<p>Template description</p>',
     *   project_id: 55,
     *   params: {
     *     copy_permissions: true,
     *     copy_cuf: true
     *   }
     * });
     */
    async createTemplateFromProject(params) {
        const body = {
            _type: 'project-template',
            name: params.name,
            label: params.label,
            description: params.description,
            project_id: params.project_id,
            params: params.params
        };
        const response = await this.makeRequest(`${this.baseURL}/projects`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create template from project: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
    /**
     * Get clearances (permissions) grouped by profiles for a project.
     *
     * @param projectId - The ID of the project
     * @param fields - Optional fields to return
     * @returns Project clearances grouped by profile
     *
     * @example
     * const clearances = await client.getProjectClearances(367);
     */
    async getProjectClearances(projectId, fields) {
        const params = fields ? `?fields=${fields}` : '';
        const response = await this.makeRequest(`${this.baseURL}/projects/${projectId}/clearances${params}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch project clearances: ${response.status} ${response.statusText}\n${errorText}`);
        }
        return await response.json();
    }
}
//# sourceMappingURL=ProjectClient.js.map