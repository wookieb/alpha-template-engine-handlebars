# Alpha template engine - handlebars

Implementation of [alpha-template-engine](https://github.com/wookieb/alpha-template-engine) that uses Handlebars.

## Usage
```js
import {HandlebarsTemplateEngine} from 'alpha-template-engine-handlebars';

const engine = new HandlebarsTemplateEngine();

// loads template.hbs and renders it
engine.renderTemplate('template', {name: 'alpha'})
    .then(result => {
        result; // Hello alpha! 
    });
```

## Constructor options

| option             | type   | default   | description                                                            |
|--------------------|--------|-----------|------------------------------------------------------------------------|
| extension          | string | "hbs"     | extension of template files                                            |
| templatesDirectory | string | undefined | location of template files - by default uses current working directory |

## API
[See JSDOC](./index.d.ts)
