const cheerio = require('cheerio');
const shortid = require('shortid');
const { executeRequest } =  require('../helpers/request');
const PTT_HOST = `https://www.ptt.cc/`;

const PTT_BEAUTY_HOST = `${PTT_HOST}/bbs/beauty/index.html`;

function parseIndex($) {
  const result = $('.r-ent').map((i, block) => {
    const blockElement = $(block);
    const hrefElement = blockElement.find('.title > a');
    const meta = blockElement.find('.meta');
    return {
      articleLink: hrefElement.attr('href'),
      text: hrefElement.text(),
      meta: {
        date: meta.find('.date').text(),
        author: meta.find('.author').text(),
      },
      id: shortid.generate(),
    }
  });
  return result;
}

function fetchFirstPicture(parsedResult, options) {
  const tasks = [];
  parsedResult.forEach((item) => {
    const task = executeRequest(`${PTT_HOST}${item.articleLink}`, {
      method: 'GET',
      json: false,
    }).then(result => {
      console.warn('fetchFirstPicture', item.articleLink, result);
      const $ = cheerio.load(result);
      const href = $('#main-content > a').attr('href');
      return {
        previewHref: href,
        id: item.id,
      }
    });
    tasks.push(task);
  });
  return Promise.all(tasks);
}
function crawl(req, res, next) {
  const crawlTarget = req.body;

  executeRequest(PTT_BEAUTY_HOST, {
    method: 'GET',
    json: false,
  }).then((result) => {
    const $ = cheerio.load(result);

    //console.warn('href', hrefs.get());
    const parsedResult = parseIndex($);
    /**
     * [
      * { articleLink: '/bbs/Beauty/M.1430099938.A.3B7.html',
          articleId: `M.1430099938.A.3B7`,
          text: '[公告] 對於謾罵，希望大家將心比心',
          meta: { date: ' 4/27', author: 'ffwind' } },
        ]
     */
    const fetchFirstPictureResult = fetchFirstPicture(parsedResult.get())

    fetchFirstPictureResult.then((results) => {
      res.json(results);
    });
   
  }).catch((err) => {
    console.error(err);
    next(err);
  
  });
}
module.exports = {
  crawl,
}

