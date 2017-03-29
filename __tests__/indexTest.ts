import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import {HandlebarsTemplateEngine} from "../index";
import * as Handlebars from 'handlebars';
import * as sinon from 'sinon';
import * as path from 'path';

import SinonMock = sinon.SinonMock;

chai.use(chaiAsPromised);
const assert = chai.assert;

describe('HandlebarsTemplateEngine', () => {

    const currentTemplatesDirectory = path.resolve(__dirname, 'templates');

    describe('hasTemplate', () => {

        describe('should return true if template exists', () => {

            it('in current working directory', () => {
                const engine = new HandlebarsTemplateEngine();
                return assert.becomes(engine.hasTemplate('__tests__/templates/template.hbs'), true);
            });

            it('(without providing extension)', () => {
                const engine = new HandlebarsTemplateEngine();
                return assert.becomes(engine.hasTemplate('__tests__/templates/template'), true);
            });

            it('in provided templates directory', () => {
                const engine = new HandlebarsTemplateEngine({templatesDirectory: currentTemplatesDirectory});
                return assert.becomes(engine.hasTemplate('template'), true);
            });

            it('and extension is not configured', () => {
                const engine = new HandlebarsTemplateEngine({extension: undefined});
                return assert.becomes(engine.hasTemplate('__tests__/templates/template.hbs'), true);
            });

        });

        describe('should return false if template does not exist', () => {
            it('in current working directory', () => {
                const engine = new HandlebarsTemplateEngine();
                return assert.becomes(engine.hasTemplate('template'), false);
            });

            it('in provided templates directory', () => {
                const engine = new HandlebarsTemplateEngine({templatesDirectory: 'templates'});
                return assert.becomes(engine.hasTemplate('doesnexist'), false);
            });
        });

        describe('should return false if template exists but configures extension is different', () => {
            const engine = new HandlebarsTemplateEngine({
                extension: 'superhbs',
                templatesDirectory: currentTemplatesDirectory
            });
            return assert.becomes(engine.hasTemplate('template'), false);
        })
    });


    describe('renderTemplate', () => {
        let mock: SinonMock;
        let engine: HandlebarsTemplateEngine;
        const data = {
            name: 'wookieb'
        };
        const expectedTemplateResult = 'Hello wookieb';

        beforeEach(() => {
            engine = new HandlebarsTemplateEngine({
                templatesDirectory: currentTemplatesDirectory
            });
        });


        it('resolves with rendered template', () => {
            return assert.becomes(engine.renderTemplate('template', data), expectedTemplateResult);
        });

        describe('compiled templates are cached', () => {

            let compileStub;
            beforeEach(() => {
                compileStub = sinon.stub(Handlebars, 'compile');
                compileStub.callThrough();
            });

            afterEach(() => {
                compileStub.restore();
            });

            it('compiles template only once', () => {
                const promise = Promise.all([
                    engine.renderTemplate('template', data),
                    engine.renderTemplate('template', data)
                ]);
                return assert.becomes(promise, [expectedTemplateResult, expectedTemplateResult])
                    .then(() => {
                        sinon.assert.calledOnce(compileStub);
                    });
            });

            it('compiles template only once even if template with and without extensions are loaded', () => {
                const promise = Promise.all([
                    engine.renderTemplate('template', data),
                    engine.renderTemplate('template.hbs', data)
                ]);
                return assert.becomes(promise, [expectedTemplateResult, expectedTemplateResult])
                    .then(() => {
                        sinon.assert.calledOnce(compileStub);
                    });
            });

            it('compiles template only once - called one by one', () => {
                const promise = engine.renderTemplate('template', data)
                    .then(() => engine.renderTemplate('template', data));

                return assert.becomes(promise, expectedTemplateResult)
                    .then(() => {
                        sinon.assert.calledOnce(compileStub);
                    });
            })

            it('compilation options are properly passed to handlebars.compile', () => {
                const compilerOptions = {
                    strange: 'compilations',
                    options: 1
                };

                engine.compilerOptions = compilerOptions;

                return assert.becomes(engine.renderTemplate('template', data), expectedTemplateResult)
                    .then(() => {
                        sinon.assert.calledWithMatch(compileStub, sinon.match.any, sinon.match.same(compilerOptions));
                    });
            });
        });


        it('rejects if template does not exist', () => {
            return assert.isRejected(engine.renderTemplate('supertemplate'), Error, 'Template "supertemplate" does not exist');
        });


    });


});