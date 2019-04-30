export default {
  files: ['test/ava/__tests__/**/*.js', 'src/__tests__/*_ava.spec.js'],
  require: ['./test/ava/helpers/setup.js', '@babel/register']
}
