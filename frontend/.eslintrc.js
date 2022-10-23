module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        "plugin:react/recommended",
        "standard-with-typescript",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: "module",
        project: ["./tsconfig.json"],
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            parserOptions: {
                project: ["./tsconfig.json"],
            },
        },
    ],
    plugins: ["react", "@typescript-eslint"],
    rules: {
        "no-console": [
            "warn",
            {
                allow: ["warn", "error"],
            },
        ],
        indent: ["error", 4],
        "import/prefer-default-export": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-filename-extension": [
            1,
            { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "react/display-name": "off",
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/prefer-optional-chain": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/triple-slash-reference": [
            "error",
            {
                path: "always",
                types: "prefer-import",
                lib: "always",
            },
        ],
        "spaced-comment": [
            "error",
            "always",
            {
                markers: ["/"],
            },
        ],
    },
    settings: {
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
        react: {
            version: "detect",
        },
    },
};
