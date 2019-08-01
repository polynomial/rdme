const config = require('config');
const puppeteer = require('puppeteer');
const pdfMerge = require('easy-pdf-merge');
const fs = require('fs');
const { promisify } = require('util')
const removeFileAsync = promisify(fs.unlink)
const args = process.argv.slice(3);

exports.desc = 'Generate your all pages into PDF format and save into file';
exports.category = 'utilities';
exports.weight = 3;
exports.action = 'pdf [filename]';

const configStore = require('../lib/configstore');

exports.run = async function() {
  const project = configStore.get('project');

  if (!project) {
    return Promise.reject(new Error(`Please login using ${config.cli} login`));
  }

  if (args[0]) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const referencePageUrl = 'https://' + project + '.readme.io/reference';
    const docPageUrl = 'https://' + project + '.readme.io/docs';

    await page.goto(referencePageUrl);
    await page.pdf({ path: 'reference.pdf', format: 'A4' });

    await page.goto(docPageUrl);
    await page.pdf({ path: 'docs.pdf', format: 'A4' });

    await browser.close();

    pdfMerge(['./reference.pdf', './docs.pdf'], './' + args[0], async err => {
      if (err) return console.log(err);
      console.log('success in PDF documents merge');
      await removeFileAsync('./reference.pdf');
    });

    // await fs.unlink('./docs.pdf', err => {
    //   if (err) throw err;
    //   console.log('Docs document deleted!');
    // });

  } else {
    console.log('Please input PDF file name');
  }
  return Promise.resolve();
};