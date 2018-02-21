var elasticsearch = require('elasticsearch');
var csv = require('csv-parser');
var fs = require('fs');

var esClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'info'
});

esClient.indices.create({
	index: '911',
	body: {
		mappings: {
			appel: {
				properties: {
					location: {type: 'geo_point'}
				}
			}
		}
	}
}, (err, resp) => {
	if(err) console.log(err);
});

let appels = [];
fs.createReadStream('../911.csv')
    .pipe(csv())
    .on('data', data => {
	appels.push({
		lat : data.lat,
		lon : data.lng,
		desc : data.desc,
		zip : data.zip,
		title : data.title.substr(data.title.indexOf(':') + 1, data.title.length - 1).trim(),
		cat : data.title.substr(0, data.title.indexOf(':')).trim(),
		timeStamp : data.timeStamp,
		twp : data.twp,
		addr : data.addr,
		e : data.e
    });
    })
    .on('end', () => {
    esClient.bulk(createBulkInsertQuery(appels), (err, resp) => {
		if (err) console.trace(err.message);
		else console.log(`Inserted ${resp.items.length} appels`);
		esClient.close();
    });
    });

	// Fonction utilitaire permettant de formatter les données pour l'insertion "bulk" dans elastic
function createBulkInsertQuery(appels) {
  const body = appels.reduce((acc, appel) => {
    const { lat,lon,desc,zip,title,cat,timeStamp,twp,addr,e } = appel;
    acc.push({ index: { _index: '911', _type: 'appel' } })
    acc.push({ location: {lat,lon},desc,zip,title,cat,timeStamp,twp,addr,e })
    return acc
  }, []);

  return { body };
}
