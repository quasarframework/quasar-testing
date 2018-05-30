console.log(`
HUDOC: https://localhost:9090/
cypress:open
"test:mw":"quasar test('webpack:babel:nyc:mocha-webpack(chai:sinon)', '["watch",port=9090]')"

`)

// let TToS = require(__dirname + '/package.json')
let TToS = require(__dirname + '/package.json')

console.log("lint: " +TToS.scripts['lint'])
TToS.scripts['lint:fix'] = 'eslint --ext .js,.vue src --fix'
console.log("lint: " +TToS.scripts['lint:fix'])
const glob = require('glob')
const fs = require('fs')
// todo: this should hook the host repo
fs.writeFile(__dirname + '/package.json', JSON.stringify(TToS, null, 2), function(err) {
	if (err) {
		console.log(err)
	}
})
// "lint": "eslint --ext .js,.vue src",
// "lint:fix": "eslint --ext .js,.vue src --fix",
// webpack:babel:jest
// webpack:babel:ava

const getDirectories = function (src, callback) {
	glob(src + '/**/*', callback);
};
getDirectories('test', function (err, res) {
	if (err) {
		console.log('Error', err);
	} else {
		console.log(res);
	}
});