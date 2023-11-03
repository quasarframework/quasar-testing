# Vue-cli + Quasar + Cypress Component Test

This project has the configuration to work with vue-cli + quasar + cypress component test

### Main change you need to do

When you use Quasar in your project, you need to inject that into vue in your main app(main.ts), you would have a code like this:

/src/main.ts

```
import { createApp } from 'vue';
import App from './App.vue';
import { Quasar } from 'quasar';
import quasarUserOptions from './quasar-user-options';

createApp(App).use(Quasar, quasarUserOptions).mount('#app');

```

As we can see above we are injecting quasar into VUe, so Vue can identify the quasar components and use that.

With Cypress we have to do the same thing, we have to let cypress knows when we mount which we use the quasar/vue mount, we have to inject Quasar into that mount.

/cypress/support/commands.ts

```
import { mount } from 'cypress/vue';
import { Quasar } from 'quasar';
import quasarUserOptions from '../../src/quasar-user-options';

Cypress.Commands.add('mount', (component, options = {}) => {
  // Setup options object
  options.global = options.global || {};
  options.global.stubs = options.global.stubs || {};
  options.global.components = options.global.components || {};
  options.global.plugins = options.global.plugins || [];

  /* Add any global plugins */
  options.global.plugins.push({
    install(app) {
      app.use(Quasar, quasarUserOptions);
    },
  });

  /* Add any global components */
  // options.global.components['Button'] = Button;

  return mount(component, options);
});
```

### Running this Example Project

This current folder cypress-component-test has setup vue-cli + quasar + cypress.

1. Install the dependencies

```
npm install
```

2. Run cypress and choose the component test

```
npx cypress open
```

3. You will see a Quasar Component Test and a Simple Component Test without quasar.

4. Select the Test and those should run with no issue.

### Troubleshooting

1. Start by creating a Simple component without quasar, just to test if that simple component can be render in your cypress project.
   1.1. After you check that a Simple component loads check change your component to have a simple quasar component.

2. On Cypress, open the Chrome Developer Console, usually that shows an error, like:

```
Cannot read properties of undefined (reading 'dark')

  12 |   return computed(() => (
  13 |     props.dark === null
> 14 |       ? $q.dark.isActive
     |            ^
  15 |       : props.dark
  16 |   ))
  17 | }

```

This error above happens because we haven't inject quasar on mount, so the $q doesn't exist and quasar try to load which generates the error above.
