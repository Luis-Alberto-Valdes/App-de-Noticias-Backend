import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'
import { neostandard } from 'neostandard/lib/main.js'

export default defineConfig([
  neostandard(),
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.browser } },
])
