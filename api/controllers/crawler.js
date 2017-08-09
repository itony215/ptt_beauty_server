const cheerio = require("cheerio");
const shortid = require("shortid");
const { executeRequest } = require("../helpers/request");
const { BeautyPage } = require("../../model/BeautyPage");

const PTT_HOST = `https://www.ptt.cc/`;

const PTT_BEAUTY_HOST = `${PTT_HOST}/bbs/beauty/index.html`;

const ID_REGEX = /[^\/].+[^.html$]/;
function parseNavigationLink($) {
  const pages = [];
  $(".btn-group-paging > a").map((i, item) => {
    const pageItemElement = $(item);
    pages[i] = pageItemElement.attr("href");
  });
  return pages;
}
function parseArticles($) {
  const result = $(".r-ent")
    .filter((i, block) => {
      const blockElement = $(block);
      const hrefElement = blockElement.find(".title > a");
      const articleLink = hrefElement.attr("href");
      return blockElement.prevAll(".r-list-sep").length === 0 && articleLink;
    })
    .map((i, block) => {
      const blockElement = $(block);

      const hrefElement = blockElement.find(".title > a");
      const meta = blockElement.find(".meta");
      const articleLink = hrefElement.attr("href");
      //console.warn('articleLink', articleLink);

      const id = articleLink
        ? articleLink.match(ID_REGEX)[0]
        : shortid.generate();
      return {
        articleLink,
        text: hrefElement.text(),
        meta: {
          date: meta.find(".date").text(),
          author: meta.find(".author").text()
        },
        id
      };
    });
  return result;
}

function fetchFirstPicture(parsedResult, options) {
  const tasks = [];
  parsedResult.forEach(item => {
    const task = executeRequest(`${PTT_HOST}${item.articleLink}`, {
      method: "GET",
      json: false
    }).then(result => {
      //console.warn('fetchFirstPicture', item.articleLink, result);
      const $ = cheerio.load(result);
      const href = $("#main-content > a").attr("href");
      return Object.assign(
        {},
        {
          previewHref: href,
          id: item.id
        },
        item
      );
    });
    tasks.push(task);
  });
  return Promise.all(tasks);
}
function crawlmore(req, res, next) {
  const { url } = req.query;
  console.warn("crawl url", !!url);
  const crawlTarget = !url ? PTT_BEAUTY_HOST : `${PTT_HOST}${url}`;
  executeRequest(crawlTarget, {
    method: "GET",
    json: false
  })
    .then(result => {
      const $ = cheerio.load(result);

      //console.warn('href', hrefs.get());
      const navResult = parseNavigationLink($);
      console.warn("navResult", navResult);
      const parsedResult = parseArticles($);
      /*
      [
       { articleLink: '/bbs/Beauty/M.1430099938.A.3B7.html',
          articleId: `M.1430099938.A.3B7`,
          text: '[公告] 對於謾罵，希望大家將心比心',
          meta: { date: ' 4/27', author: 'ffwind' } },
        ]
     */
      const fetchFirstPictureResult = fetchFirstPicture(parsedResult.get());

      fetchFirstPictureResult.then(results => {
        res.links({
          prev: navResult[1],
          next: navResult[2],
          last: navResult[3]
        });

        const saveTasks = results.map(result => {
          const content = {
            articleId: result.id,
            title: result.text,
            previewHref: result.previewHref,
            date: result.meta.date,
            author: result.meta.author
          };
          console.warn("content", content);
          return BeautyPage.update({ articleId: result.id }, content, {
            upsert: true
          });
        });

        Promise.all(saveTasks).then(() => {
          res.json(results);
        });
      });
    })
    .catch(err => {
      console.error(err);
      next(err);
    });
}

function crawl(req, res, next) {
  const { url } = req.query;
  console.warn("crawl url", !!url);
  var crawlTarget = !url ? PTT_BEAUTY_HOST : `${PTT_HOST}${url}`;
  executeRequest(crawlTarget, {
    method: "GET",
    json: false
  })
    .then(result => {
      const $ = cheerio.load(result);

      //console.warn('href', hrefs.get());
      const navResult = parseNavigationLink($);
      console.warn("navResult", navResult);
      const parsedResult = parseArticles($);
      /**
     * [
      * { articleLink: '/bbs/Beauty/M.1430099938.A.3B7.html',
          articleId: `M.1430099938.A.3B7`,
          text: '[公告] 對於謾罵，希望大家將心比心',
          meta: { date: ' 4/27', author: 'ffwind' } },
        ]
     */
      const fetchFirstPictureResult = fetchFirstPicture(parsedResult.get());

      fetchFirstPictureResult.then(results => {
        res.links({
          prev: navResult[1],
          next: navResult[2],
          last: navResult[3]
        });
        console.log("============++++++" + navResult[1]);
        //crawlTarget = `${PTT_HOST}${navResult[1]}`;

        const saveTasks = results.map(result => {
          /*const beautyPage = new BeautyPage({
            articleId: result.id,
            title: result.text,
            previewHref: result.previewHref,
            date: result.meta.date,
            author: result.meta.author
          });
          return beautyPage.save();*/
          const content = {
            articleId: result.id,
            title: result.text,
            previewHref: result.previewHref,
            date: result.meta.date,
            author: result.meta.author,
            page: crawlTarget
          };
          return BeautyPage.update({ articleId: result.id }, content, {
            upsert: true
          });
        });

        Promise.all(saveTasks)
          .then(() => {
            console.warn("res.json");
            res.json(results);
          })
          .catch(err => {
            console.warn("err", err);
          });
        //res.json(results);
      });
    })
    .catch(err => {
      console.error(err);
      next(err);
    });
}

module.exports = {
  crawl,
  crawlmore
};
