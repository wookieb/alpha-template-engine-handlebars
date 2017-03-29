/// <reference types="handlebars" />
import { TemplateEngine } from "alpha-template-engine";
export interface HandlebarsTemplateEngineOptions {
    /**
     * Template files extension - defaults to "hbs"
     *
     * Extension is added to all files unless they already have current extension provided.
     *
     * For example:
     * template => template.hbs will be loaded
     * template.hbs => template.hbs will be loaded
     * template.html => template.html.hbs will be loaded
     */
    extension?: string;
    /**
     * Directory with templates - defaults to current working directory
     */
    templatesDirectory?: string;
}
export declare class HandlebarsTemplateEngine implements TemplateEngine<string> {
    private compiledTemplates;
    private options;
    private loadingTemplates;
    /**
     * Compilation options provided to Handlebars.compile
     *
     * @type {Object}
     */
    compilerOptions: CompileOptions;
    static defaultOptions: HandlebarsTemplateEngineOptions;
    /**
     * @param {HandlebarsTemplateEngineOptions} [options]
     */
    constructor(options?: HandlebarsTemplateEngineOptions);
    hasTemplate(name: string): Promise<boolean>;
    private normalizeTemplateName(name);
    private isCompiled(name);
    private getTemplatePath(name);
    renderTemplate(name: string, data?: any): Promise<string>;
    private compileTemplate(name);
}
