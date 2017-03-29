"use strict";
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const regexpEscape = require('escape-regexp');
class HandlebarsTemplateEngine {
    constructor(options) {
        this.compiledTemplates = Object.create(null);
        this.compilerOptions = {};
        this.loadingTemplates = Object.create(null);
        this.options = Object.assign({}, HandlebarsTemplateEngine.defaultOptions, options);
    }
    /**
     * @inheritDoc
     * @param name
     * @returns {Promise<boolean>}
     */
    hasTemplate(name) {
        name = this.normalizeTemplateName(name);
        if (this.isCompiled(name)) {
            return Promise.resolve(true);
        }
        const path = this.getTemplatePath(name);
        return new Promise((resolve) => {
            fs.stat(path, e => resolve(!e));
        });
    }
    normalizeTemplateName(name) {
        if (!this.options.extension) {
            return name;
        }
        const regexp = new RegExp('\.' + regexpEscape(this.options.extension) + '$', 'i');
        return name.replace(regexp, '');
    }
    isCompiled(name) {
        return name in this.compiledTemplates;
    }
    getTemplatePath(name) {
        if (this.options.extension) {
            name += '.' + this.options.extension;
        }
        if (this.options.templatesDirectory) {
            return path.resolve(this.options.templatesDirectory, name);
        }
        return name;
    }
    renderTemplate(name, data) {
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
    compileTemplate(name) {
        const path = this.getTemplatePath(name);
        if (path in this.loadingTemplates) {
            console.log('returning precached promise', path);
            return this.loadingTemplates[path];
        }
        const loadContentPromise = new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (e, content) => {
                if (e) {
                    reject(e);
                    return;
                }
                resolve(content);
            });
        });
        const compilePromise = loadContentPromise.then(content => {
            const template = Handlebars.compile(content, this.compilerOptions);
            this.compiledTemplates[name] = template;
            delete this.loadingTemplates[path];
            return template;
        });
        this.loadingTemplates[path] = compilePromise;
        return compilePromise;
    }
}
HandlebarsTemplateEngine.defaultOptions = {
    extension: 'hbs'
};
exports.HandlebarsTemplateEngine = HandlebarsTemplateEngine;
