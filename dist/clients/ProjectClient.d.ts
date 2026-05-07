import { BaseClient } from './BaseClient.js';
import type { Project, ProjectTemplate, CreateProjectParams, CreateProjectFromTemplateParams, CreateTemplateParams, CreateTemplateFromProjectParams, ProjectClearances, PagedResponse } from '../types.js';
/**
 * Client for Squash TM Projects API operations.
 * Handles project and project template management, including creation, retrieval, and clearances.
 *
 * @extends BaseClient
 */
export declare class ProjectClient extends BaseClient {
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
    getAllProjects(options?: {
        page?: number;
        size?: number;
        type?: 'STANDARD' | 'TEMPLATE';
        milestoneId?: number;
        milestoneLabel?: string;
        fields?: string;
    }): Promise<PagedResponse>;
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
    getProject(projectId: number, fields?: string): Promise<Project>;
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
    getProjectByName(projectName: string, fields?: string): Promise<Project>;
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
    createProject(params: CreateProjectParams): Promise<Project>;
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
    createProjectFromTemplate(params: CreateProjectFromTemplateParams): Promise<Project>;
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
    createProjectTemplate(params: CreateTemplateParams): Promise<ProjectTemplate>;
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
    createTemplateFromProject(params: CreateTemplateFromProjectParams): Promise<ProjectTemplate>;
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
    getProjectClearances(projectId: number, fields?: string): Promise<ProjectClearances>;
}
//# sourceMappingURL=ProjectClient.d.ts.map