import { defineConfig } from '@umijs/max';
import devEnv from './env.dev';
import prodEnv from './env.prod';
import testEnv from './env.test';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV, REACT_APP_VERSION, REACT_APP_TIME } = process.env;

type EnvConfig = Record<string, Record<string, string>>;

const env: EnvConfig = {
  dev: devEnv,
  prod: prodEnv,
  test: testEnv,
};
export default defineConfig({
  title: '海峡金成品立体库',
  antd: {
    configProvider: {},
    appConfig: {},
  },
  hash: true,
  model: {},
  initialState: {},
  request: {},
  reactQuery: {},
  layout: {},
  routes,
  mock: false,
  manifest: {
    basePath: '/',
  },
  proxy: proxy.dev,
  define: {
    'process.env.REACT_APP_ENV': REACT_APP_ENV,
    'process.env.REACT_APP_VERSION': REACT_APP_VERSION,
    'process.env.REACT_APP_TIME': REACT_APP_TIME,
    ...(REACT_APP_ENV && env[REACT_APP_ENV] ? env[REACT_APP_ENV] : devEnv),
  },
  npmClient: 'npm',
  extraBabelPlugins: [...(REACT_APP_ENV === 'dev' || REACT_APP_ENV === 'test' ? [] : ['transform-remove-console'])],
  ...(REACT_APP_ENV !== 'dev' ? { utoopack: {} } : {}),
  tailwindcss: {},
});
