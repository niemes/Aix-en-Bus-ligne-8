//index.js
const axios = require('axios'),
	phantom = require('phantom'),
	conf = require('../conf.json'),
	cheerio = require('cheerio'),
	chalk = require('chalk'),
	colors = require('colors'),
	Table = require('cli-table2'),
	ora = require('ora'),
	moment = require('moment'),
	spinner = ora();

const today = moment().format('DD/MM/YYYY');
const site = "https://www.lepilote.com/fr/horaires-a-larret/28/StopTimeTable/";
const arret = conf.arret
const code_postal = "/" + conf.code_postal + "/four-deyglun-val-de-larc/945/val-de-larc/";
const date = "2?Date=" + today + "#timetable";


const url = site + arret + code_postal + date;
const log = console.log;
const busStop = chalk.blue(`


	██████╗██╗   █████████╗    ███████████████╗██████╗██████╗     ██╗    ██╗█████╗████████╗████████╗  ███████████████╗
	██╔══████║   ████╔════╝    ██╔════╚══██╔══██╔═══████╔══██╗    ██║    ████╔══██╚══██╔══██╔════██║  ████╔════██╔══██╗
	██████╔██║   █████████╗    ███████╗  ██║  ██║   ████████╔╝    ██║ █╗ █████████║  ██║  ██║    ████████████╗ ██████╔╝
	██╔══████║   ██╚════██║    ╚════██║  ██║  ██║   ████╔═══╝     ██║███╗████╔══██║  ██║  ██║    ██╔══████╔══╝ ██╔══██╗
	██████╔╚██████╔███████║    ███████║  ██║  ╚██████╔██║         ╚███╔███╔██║  ██║  ██║  ╚████████║  ███████████║  ██║
	╚═════╝ ╚═════╝╚══════╝    ╚══════╝  ╚═╝   ╚═════╝╚═╝          ╚══╝╚══╝╚═╝  ╚═╝  ╚═╝   ╚═════╚═╝  ╚═╚══════╚═╝  ╚═╝
`);

const bus8 = chalk.yellowBright(`
              ______________
            _/_|[][][][][] | - -          _
           (    Aix en Bus | - -         [8]
           =--OO-------OO--=dwb       ____|____________

			`.yellow);
console.clear();
// console.log(busStop);
console.log(bus8);

var table = new Table({
	head: [
		{hAlign: 'center', content: 'Destination'.magenta},
		{hAlign: 'center', content:'Prochains passages'.magenta}
	],
	colWidths: [35, 25]
});

function start(url) {
	spinner.start(chalk.blueBright(' Calcul Prochain bus - en cours... '));

	(async function() {
		const instance = await phantom.create();
		const page = await instance.createPage();
		await page.on('onResourceRequested', function(requestData) {
			// console.info('Requesting', requestData.url);
		});

		const status = await page.open(url);
		const content = await page.property('content');
		// console.log(content);
		chopLesHoraires(content);
		await instance.exit();
	})();
}

function chopLesHoraires(body) {

	var $ = cheerio.load(body);

	let noBus = $('#next-departure-result .text-danger');
	let currentTime = $('#next-departure-result .hour-now').text();
	let horaires = $('#next-departure-result ul li .pull-right .item-text.bold');
	let prochainesHoraires = {
		"destination": "vers VAL DE L'ARC",
		"passages": [],
	};

	$(horaires).each(function(i, elem) {
		let passage = $(this).text();

		table.push(
			[{
					hAlign: 'center',
					content: prochainesHoraires.destination
				},
				{
					hAlign: 'center',
					content: colors.green(passage)
				}
			]
		);
	});
	afficheTout(currentTime.replace(/(?:\r\n|\r|\n)/g, ''))
}

function afficheTout(result) {

	spinner.stop();
	setTimeout(() => {
		spinner.succeed(chalk.green(result));
		log(table.toString());
		console.log();
	}, 1000);

}

start(url)
