import {TemplateEngine} from "alpha-template-engine";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";

const regexpEscape = require('escape-regexp');

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
    extension?: string,

    /**
     * Directory with templates - defaults to current working directory
     */
    templatesDirectory?: string
}

export class HandlebarsTemplateEngine implements TemplateEngine<string> {

    private compiledTemplates: {[x: string]: HandlebarsTemplateDelegate} = Object.create(null);
    private options: HandlebarsTemplateEngineOptions;
    private loadingTemplates: {[x: string]: Promise<HandlebarsTemplateEngineOptions>} = Object.create(null);

    /**
     * Compilation options provided to Handlebars.compile
     *
     * @type {Object}
     */
    public compilerOptions: CompileOptions = {};

    static defaultOptions: HandlebarsTemplateEngineOptions = {
        extension: 'hbs'
    };

    /**
     * @param {HandlebarsTemplateEngineOptions} [options]
     */
    constructor(options?: HandlebarsTemplateEngineOptions) {
        this.options = Object.assign({}, HandlebarsTemplateEngine.defaultOptions, options);
    }

    hasTemplate(name: string): Promise<boolean> {
        name = this.normalizeTemplateName(name);
        if (this.isCompiled(name)) {
            return Promise.resolve<boolean>(true);
        }

        const path = this.getTemplatePath(name);
        return new Promise((resolve) => {
            fs.stat(path, e => resolve(!e));
        });
    }

    private normalizeTemplateName(name: string) {
        if (!this.options.extension) {
            return name;
        }
        const regexp = new RegExp('\.' + regexpEscape(this.options.extension) + '$', 'i');
        return name.replace(regexp, '');
    }

    private isCompiled(name: string) {
        return name in this.compiledTemplates;
    }

    private getTemplatePath(name: string) {
        if (this.options.extension) {
            name += '.' + this.options.extension;
        }
        if (this.options.templatesDirectory) {
            return path.resolve(this.options.templatesDirectory, name);
        }
        return name;
    }

    renderTemplate(name: string, data?: any): Promise<string> {
        name = this.normalizeTemplateName(name);

        return this.hasTemplate(name)
            .then((templateExists) => {
                if (!templateExists) {
                    throw new Error(`Template "${name}" does not exist`);
                }

                if (this.isCompiled(name)) {
                    const template = this.compiledTemplates[name];
                    return template(data);
                }

                return this.compileTemplate(name)
                    .then(template => {
                        return template(data);
                    });
            });
    }

    private compileTemplate(name: string): Promise<HandlebarsTemplateDelegate> {
        const path = this.getTemplatePath(name);

        if (path in this.loadingTemplates) {
            return this.loadingTemplates[path];
        }

        const loadContentPromise = new Promise<string>((resolve, reject) => {
            fs.readFile(path, 'utf8', (e, content) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve(content);
            });
        });

        const compilePromise = loadContentPromise.then(
            content => {
                const template = Handlebars.compile(content, this.compilerOptions);
                this.compiledTemplates[name] = template;
                delete this.loadingTemplates[path];
                return template;
            }
        );

        this.loadingTemplates[path] = compilePromise;
        return compilePromise;
    }
}