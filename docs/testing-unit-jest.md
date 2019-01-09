ANYTHING TO JEST:

https://www.npmjs.com/package/jest-codemods
https://github.com/facebook/jscodeshift

TS:
```json
 {
      "type": "node",
      "request": "launch",
      "name": "Jest All",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": ["--config=test/unit/jest.conf.js"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Current File",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": ["${relativeFile}","--config=test/unit/jest.conf.js"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
```
