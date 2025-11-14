/**
 * CEL (Common Expression Language) Monarch Tokenizer
 * Generated from CEL.g4 grammar (https://github.com/google/cel-cpp)
 */

export const celLanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string'] }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" },
    { open: '`', close: '`' }
  ]
};

export const celMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.cel',

  // Keywords from CEL grammar
  keywords: [
    'true',
    'false',
    'null',
    'in'
  ],

  // Built-in functions (common CEL standard library)
  builtinFunctions: [
    'size',
    'matches',
    'startsWith',
    'endsWith',
    'contains',
    'map',
    'filter',
    'all',
    'exists',
    'exists_one',
    'has',
    'int',
    'uint',
    'double',
    'string',
    'bytes',
    'timestamp',
    'duration',
    'type',
    'dyn'
  ],

  // Operators from CEL grammar
  operators: [
    '==', '!=', '&&', '||',
    '<', '<=', '>', '>=',
    '+', '-', '*', '/', '%',
    '!', '?', ':'
  ],

  // Symbols and delimiters
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Escape sequences for strings
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  // Tokenizer rules
  tokenizer: {
    root: [
      // Identifiers (escaped with backticks)
      [/`[a-zA-Z_][a-zA-Z0-9_.\-\/\s]*`/, 'identifier.escape'],

      // Identifiers and keywords
      [/[a-zA-Z_][a-zA-Z0-9_]*/, {
        cases: {
          '@keywords': 'keyword',
          '@builtinFunctions': 'function.builtin',
          '@default': 'identifier'
        }
      }],

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // Numbers (integers, unsigned integers, floats)
      [/\d+[uU]/, 'number.uint'],
      [/\d+\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+[eE][\-+]?\d+/, 'number.float'],
      [/\d+/, 'number'],

      // Delimiter: comma, dot, colon
      [/[,.]/, 'delimiter'],
      [/:/, 'delimiter'],

      // Strings (single, double, triple-quoted, raw)
      [/r"""/, { token: 'string.raw', next: '@rawStringTripleDouble' }],
      [/r'''/, { token: 'string.raw', next: '@rawStringTripleSingle' }],
      [/r"/, { token: 'string.raw', next: '@rawStringDouble' }],
      [/r'/, { token: 'string.raw', next: '@rawStringSingle' }],
      [/"""/, { token: 'string', next: '@stringTripleDouble' }],
      [/'''/, { token: 'string', next: '@stringTripleSingle' }],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
      [/"/, { token: 'string.quote', next: '@string' }],
      [/'/, { token: 'string.quote', next: '@stringsingle' }],

      // Bytes literals
      [/[bB]"""/, { token: 'string.bytes', next: '@bytesTripleDouble' }],
      [/[bB]'''/, { token: 'string.bytes', next: '@bytesTripleSingle' }],
      [/[bB]"/, { token: 'string.bytes', next: '@bytesDouble' }],
      [/[bB]'/, { token: 'string.bytes', next: '@bytesSingle' }]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment']
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],
      [/\*\//, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    // String states
    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', next: '@pop' }]
    ],

    stringsingle: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, { token: 'string.quote', next: '@pop' }]
    ],

    stringTripleDouble: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"""/, { token: 'string', next: '@pop' }]
    ],

    stringTripleSingle: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'''/, { token: 'string', next: '@pop' }]
    ],

    // Raw strings (no escape sequences)
    rawStringDouble: [
      [/[^\\"]+/, 'string.raw'],
      [/"/, { token: 'string.raw', next: '@pop' }]
    ],

    rawStringSingle: [
      [/[^\\']+/, 'string.raw'],
      [/'/, { token: 'string.raw', next: '@pop' }]
    ],

    rawStringTripleDouble: [
      [/[^\\]+/, 'string.raw'],
      [/"""/, { token: 'string.raw', next: '@pop' }]
    ],

    rawStringTripleSingle: [
      [/[^\\]+/, 'string.raw'],
      [/'''/, { token: 'string.raw', next: '@pop' }]
    ],

    // Bytes literals
    bytesDouble: [
      [/[^\\"]+/, 'string.bytes'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.bytes', next: '@pop' }]
    ],

    bytesSingle: [
      [/[^\\']+/, 'string.bytes'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, { token: 'string.bytes', next: '@pop' }]
    ],

    bytesTripleDouble: [
      [/[^\\"]+/, 'string.bytes'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"""/, { token: 'string.bytes', next: '@pop' }]
    ],

    bytesTripleSingle: [
      [/[^\\']+/, 'string.bytes'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'''/, { token: 'string.bytes', next: '@pop' }]
    ]
  }
};
