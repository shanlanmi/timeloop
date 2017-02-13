module.exports = {
  extends: "airbnb/legacy",
  plugins: [
    "react"
  ],
  "no-multi-spaces": [0, {
    exceptions: {
      VariableDeclaration: true
    }
  }],
  globals: {
    ps: true
  },
  rules: {
    // Possible Errors
    "no-await-in-loop": [2],
    "no-console": [2, {
      allow: ["log", "error", "warn", "info", "time", "timeEnd"]
    }],
    "no-extra-parens": [
      2,
      "all",
      {
        conditionalAssign: true,
        nestedBinaryExpressions: false,
        returnAssign: false
      }
    ],
    "no-template-curly-in-string": [0],
    // Best Practices
    "no-div-regex": [0],
    "vars-on-top": 0,
    "no-implicit-coercion": [
      2,
      {
        boolean: false,
        number: true,
        string: true,
        allow: []
      }
    ],
    "no-implicit-globals": [2],
    "no-return-await": [2],
    "no-unmodified-loop-condition": [2],
    "no-useless-call": [2],
    eqeqeq: [2, "smart"],
    "no-eval": [0],
    // Variables
    "no-unused-vars": [2, {
      vars: "all",
      args: "none",
    }],
    "no-shadow": [0],
    // Node.js and CommonJS
    "callback-return": [2],
    "handle-callback-err": [2],
    "no-process-env": [2],
    "global-require": 0,
    // Stylistic Issues
    "comma-dangle": [0],
    "max-len": [2, 100, 2, {
      ignoreComments: true,
      ignoreTrailingComments: true,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true
    }],
    "func-names": [0, "never"],
    "no-underscore-dangle": [0],
    quotes: [0],
    "no-param-reassign": [0],
    "one-var": [0],
    "padded-blocks": [0],
    "react/require-extension": [0],
    "spaced-comment": [0],
    "space-before-function-paren": [0],
    // ECMAScript 6
    "no-class-assign": [0],         // Need use strict
    "no-const-assign": [0],         // Need use strict
    "no-dupe-class-members": [0],   // Need use strict
    "no-duplicate-imports": [0],
    "no-new-symbol": [0],
    "no-restricted-imports": [0],
    "no-useless-constructor": [0],  // Need use strict
    "no-var": [0],                  // Need use strict
    "prefer-const": [0],            // Need use strict
    "prefer-numeric-literals": [0],
    "prefer-template": [0],
    "require-yield": [0],
    "template-curly-spacing": [0],
    "prefer-arrow-callback": 0,
    "prefer-rest-params": [0],
    "arrow-body-style": [0],        // es6
    "arrow-paren": [0],             // es6
    "arrow-spacin": [0],            // es6
    "constructor-supe": [0],        // es6
    "generator-star-spacin": [0],   // es6
    "no-confusing-arro": [0],       // es6
    "no-new-symbo": [0],            // es6
    "no-restricted-import": [0],    // es6
    "no-this-before-supe": [0],     // es6
    "no-useless-computed-ke": [0],  // es6
    "no-useless-renam": [0],        // es6
    "object-shorthan": [0],         // es6
    "prefer-numeric-literal": [0],  // es6
    "prefer-templat": [0],          // es6
    "require-yiel": [0],            // es6
    "template-curly-spacin": [0],    // es6
    // import
    "import/no-extraneous-dependencies": [0],
    "import/no-dynamic-require": [0]
  }
};
