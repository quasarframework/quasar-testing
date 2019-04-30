const et = require('elementtree'),
  axios = require('axios'),
	fs = require('fs-extra'),
	platform = require('platform-detect'),
  crypto = require('crypto'),
	AdmZip = require('adm-zip')

const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

/**
 * Easily and nicely modify bytes to something that humans understand.
 *
 * @author Razvan Stoenescu
 * @param bytes
 * @returns {string}
 */

function humanStorageSize (bytes) {
	let u = 0

	while (parseInt(bytes, 10) >= 1024 && u < units.length - 1) {
		bytes /= 1024
		++u
	}

	return `${bytes.toFixed(1)} ${units[u]}`
}


module.exports = function (api) {
  api.prompts.options.forEach((val) => {
    if (val === 'zap_local') {
	    axios.get('https://raw.githubusercontent.com/zaproxy/zap-admin/master/ZapVersions.xml')
	    .then(function (response) {
		    const source = et.parse(response.data.toString())
		    let route = null, fileName, size, hash, forceDownload


		    route = source.findtext('./core/daily/url').toString()
		    fileName = source.findtext('./core/daily/file')
		    size = source.findtext('./core/daily/size')
		    hash = source.findtext('./core/daily/hash')

		    // keep this for the next big update, for now use the daily

		    /*
		    if (platform.windows) {
			    route = source.findtext('./core/windows/url').toString()
			    fileName = source.findtext('./core/windows/file')
			    size = source.findtext('./core/windows/size')
			    hash = source.findtext('./core/windows/hash')
		    } else if (platform.linux) {
			    route = source.findtext('./core/linux/url').toString()
			    fileName = source.findtext('./core/linux/file')
			    size = source.findtext('./core/linux/size')
			    hash = source.findtext('./core/linux/hash')
		    } else if (platform.macos) {
			    route = source.findtext('./core/mac/url').toString()
			    fileName = source.findtext('./core/mac/file')
			    size = source.findtext('./core/mac/size')
			    hash = source.findtext('./core/mac/hash')
		    } else {
			    console.log('Platform not supported, zap not installed')
		    }
		    */

		    fs.pathExists(fileName, (err, exists) => {

		    	if (err) {
		    		console.log(err)
			    }

		    	if (exists && route !== null) {
		    		console.log('File exists, comparing checksum with published value')
				    const fileHashLocal = crypto.createHash('sha1')
				    const reader = fs.createReadStream(fileName)
				    reader.on('data', (chunk) => {
					    fileHashLocal.update(chunk)
				    })
				    reader.on('end', () => {
					    if (fileHashLocal.digest('hex') === hash.split(':')[1]) {
						    fs.ensureDir('./zap')
						    .then(() => {
							    process.stdout.write('SHA1 checksum of existing zip matches published value.\n')
							    process.stdout.write('Overwriting existing directory to mainain consistency.\n')

							    const zip = new AdmZip(fileName)
							    zip.extractAllTo("./zap/", true)

							    // register ./zap/ZAP_D-2019-04-29
							    let zipFolder = fileName.split('_')
							    zipFolder = zipFolder[0] + '_' + zipFolder[2]
							    console.log('./zap/'+zipFolder.split('.')[0]+'/zap.sh -daemon ')
						    })
					    } else {
						    process.stdout.write('SHA1 checksum does not match, downloading again.\n')
						    const forceDownload = true
					    }
				    })
			    }
			    if ((!exists && route !== null) || (forceDownload === true && route !== null)) {
				    console.log(`\n\n*  Downloading ${fileName} from`)
				    console.log(route)
				    // make sure to check if it exists

				    axios({
					    responseType: 'stream',
					    url: route
				    }).then((result) => {
					    console.log('Server says:   ', humanStorageSize(parseInt(result.headers['content-length'])))
					    console.log('Package says:  ', humanStorageSize(parseInt(size)))
					    console.log('----------------------')


					    const writer = fs.createWriteStream(fileName)
					    const fileHash = crypto.createHash('sha1')

					    result.data.pipe(writer)
					    let dataLength = 0

					    result.data.on('data', (chunk) => {
						    dataLength += chunk.length
						    fileHash.update(chunk)
						    // if zip unzip
						    process.stdout.write(`Downloaded:     ${humanStorageSize(parseInt(dataLength))}              \r`)
					    })
					    result.data.on('end', () => {
						    if (fileHash.digest('hex') === hash.split(':')[1]) {
							    process.stdout.write('SHA1 checksum of download matches published value.            \n')

							    fs.ensureDir('./zap')
							    .then(() => {
								    const zip = new AdmZip(fileName)
								    zip.extractAllTo("./zap/", true)

								    /*
										const unzip = zlib.unzip(),
											r = fs.createReadStream(fileName),
											w = fs.createWriteStream('./zap/')
											r.pipe(unzip).pipe(w)
										*/

							    })
							    .catch(err => {
								    console.error(err)
							    })

						    } else {
							    console.log('SHA1 checksum does not match')
						    }
					    })
				    })
			    }
		    }) // end fileExists


	    })
	    .catch(err => {
		    console.log('Could not install ZAPROXY at this time.')
	    })
    } else if (val === 'scripts') {
	    api.extendPackageJson({
		    scripts: {
		    }
	    })
    }
  })
	// api.render('./base')
}
