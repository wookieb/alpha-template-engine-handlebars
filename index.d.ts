/// <reference types="handlebars" />
import { TemplateEngine } from "alpha-template-engine";
export interface HandlebarsTemplateEngineOptions {
    /**
     * Template files extension - default "hbs"
     */
    extension?: string;
    /**
     * Directory with templates - default to current working directory
     */
    templatesDirectory?: string;
}
export declare class HandlebarsTemplateEngine implements TemplateEngine<string> {
    private compiledTemplates;
    private options;
    compilerOptions: CompileOptions;
    private loadingTemplates;
    static defaultOptions: HandlebarsTemplateEngineOptions;
    constructor(options?: HandlebarsTemplateEngineOptions);
    /**
     * @inheritDoc
     * @param name
     * @returns {Promise<boolean>}
     */
    hasTemplate(name: string): Promise<boolean>;
    private normalizeTemplateName(name);
    private isCompiled(name);
    private getTemplatePath(name);
    renderTemplate(name: string, data?: any): Promise<string>;
    private compileTemplate(name);
}
