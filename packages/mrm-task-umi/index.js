'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const mrm_core_1 = require('mrm-core');
const semver_1 = __importDefault(require('semver'));
const kleur_1 = __importDefault(require('kleur'));
const path_1 = __importDefault(require('path'));
const NodeVersion = '16';
function checkEnvironment() {
  const currentNodeVersion = semver_1.default.clean(process.version);
  if (semver_1.default.lte(currentNodeVersion, `${NodeVersion}.0.0`)) {
    console.log(
      `${kleur_1.default.red(
        'error',
      )} @: expected node version "${NodeVersion}.x". Got "${currentNodeVersion}"`,
    );
    process.exit(1);
  }
}
function removeFiles() {
  (0, mrm_core_1.deleteFiles)([
    'src/pages/index.tsx',
    'src/pages/index.less',
    '.prettierrc',
  ]);
}
function addFiles() {
  const files = [
    'src/layouts/default/index.tsx',
    'src/pages/home/index/index.tsx',
    'src/pages/home/index/styled.ts',
    'src/pages/document.ejs',
    'src/hooks/index.ts',
    'src/routes.ts',
    'src/utils/index.ts',
    'src/utils/merge-props.ts',
    'src/utils/merge-list.ts',
    'src/utils/parse-query.ts',
    'src/utils/storage.ts',
    'src/utils/yup.ts',
    'scripts/check-yarn.js',
    'typings.d.ts',
    'commitlint.config.js',
    '.umirc.dev.ts',
    '.umirc.test.ts',
    '.umirc.prod.ts',
    '.umirc.ts',
    '.eslintrc.js',
    'src/app.tsx',
    'src/global.less',
  ];
  files.forEach((file) => {
    (0, mrm_core_1.template)(
      file,
      path_1.default.join(__dirname, 'templates', file),
    )
      .apply()
      .save();
  });
}
function addDirs() {
  (0, mrm_core_1.makeDirs)(['src/services', 'src/components']);
}
function changeFiles() {
  (0, mrm_core_1.lines)('.prettierignore').add(['dist']).save();
  (0, mrm_core_1.lines)('.nvmrc').add([NodeVersion]).save();
  (0, mrm_core_1.lines)('.prettierrc.js')
    .add([
      "const fabric = require('@umijs/fabric');",
      '',
      'module.exports = {',
      '  ...fabric.prettier,',
      '};',
    ])
    .save();
  (0, mrm_core_1.json)('package.json')
    .merge({
      engines: {
        node: `${NodeVersion}.x`,
      },
      jest: {
        testPathIgnorePatterns: ['.umirc*'],
      },
    })
    .save();
}
function installDependencies() {
  (0, mrm_core_1.install)(
    [
      '@umijs/hooks',
      'styled-components',
      'antd-mobile@next',
      'antd-mobile-icons',
      'umi-plugin-keep-alive',
      'query-string',
      'dayjs',
      'ts-pattern',
      'yup',
      '@ebay/nice-modal-react',
    ],
    {
      yarn: true,
      dev: false,
    },
  );
  (0, mrm_core_1.install)(
    [
      '@types/styled-components',
      '@commitlint/config-conventional',
      '@commitlint/cli',
      '@umijs/fabric',
    ],
    {
      yarn: true,
      dev: true,
    },
  );
}
function changeScripts() {
  const pkg = (0, mrm_core_1.packageJson)();
  const postinstall = pkg.getScript('postinstall');
  const prettier = pkg.getScript('prettier');
  const test = pkg.getScript('test');
  const testCoverage = pkg.getScript('test:coverage');
  pkg
    .removeScript('build')
    .removeScript('postinstall')
    .removeScript('prettier')
    .removeScript('test')
    .removeScript('test:coverage')
    .save();
  pkg
    .setScript('start', 'yarn dev')
    .setScript('dev', 'UMI_ENV=dev umi dev')
    .setScript('build:test', 'UMI_ENV=test umi build')
    .setScript('build:prod', 'UMI_ENV=prod umi build')
    .setScript('preinstall', 'node scripts/check-yarn.js')
    .setScript('postinstall', postinstall)
    .setScript('prettier', prettier)
    .setScript('test', test)
    .setScript('test:coverage', testCoverage)
    .save();
}
module.exports = function task() {
  checkEnvironment();
  removeFiles();
  addFiles();
  addDirs();
  changeFiles();
  installDependencies();
  changeScripts();
};
