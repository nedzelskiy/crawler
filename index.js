const fse = require('fs-extra');
const fetch = require("node-fetch");
const { parse } = require('node-html-parser');

( async () => {

async function getData(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    if (text.length < 200) {
      console.log(`no body :( url[${url}] response [${text}]`);
    }
    return text;
  } catch (error) {
    console.log(error);
    return null;
  }
}

const domain = 'http://192.168.0.100:1111';
const logFileName = `logs/body-ssr-log-${new Date().getTime()}.txt`;
const page = await getData(`${domain}/`);
const root = parse(page);
const allATagsHrefs = [... new Set(
  root.querySelectorAll('a')
    .map((aTag) => {
        return aTag.getAttribute('href');
      })
    .filter(href => href.indexOf('http') < 0 && href !== domain && href !== `${domain}/`),
  )];

console.log(`Starting parse ${allATagsHrefs.length} a tags:`);

for (let i = 0; i < allATagsHrefs.length; i++) {
  const href = allATagsHrefs[i];
  const url = `${domain}${href}?debug098`;
  process.stdout.write(`trying... ${url} ... [${i+1} / ${allATagsHrefs.length}]`);
  const page = await getData(url);
  fse.appendFileSync(logFileName, `${new Date().toUTCString()} ${url} ${page ? page.length : 'null'} ${page && page.slice(0,300)}...  \r\n`);
  if (page) {
    process.stdout.write(` DONE \r\n`);
  }
}

})();
