var mocha = require("mocha");
const { crawl } = require("../../../api/controllers/crawler");
require("../../../db");

function crawlMore(url) {
  return new Promise((resolve, reject) => {
    const mockReq = {
      crawlTarget: "",
      query: { //本來沒給query 會錯
        url
      }
    };
    const mockRes = {
      json: result => {
        console.warn("json result", result);
      },
      links: pageInfo => {
        console.warn("pageInfo", pageInfo);
        resolve(pageInfo);
      }
    };

    const mockNext = err => {
      console.warn("err", err);
      reject();
    };

    crawl(mockReq, mockRes, mockNext);
  });
}
describe("Test", () => {
  /*it("test crawl beauty index", function(done) {
    const mockReq = {
      crawlTarget: "",
      query: {}
    };
    const mockRes = {
      json: result => {
        console.warn("json result", result);
        done(!result);
      },
      links: pageInfo => {
        console.warn("pageInfo", pageInfo);
      }
    };

    const mockNext = err => {
      console.warn("err", err);
      done(err);
    };

    crawl(mockReq, mockRes, mockNext);
  }).timeout(10000);*/

  it("test crawl multipe", done => {
    crawlMore("")
      .then(pageInfo => {
        const pageNum = pageInfo.prev;
      })
      .then(pageInfo => {
        const numberArr = Array.from(Array(2240).keys());
        numberArr.shift();
        console.warn("numberArr", numberArr);

        return numberArr.reduce((promise, pageNumber) => {
          return promise.then(() => {
            return crawlMore(`/bbs/Beauty/index${pageNumber}.html`);
          });
        }, Promise.resolve());
        crawlMore(pageInfo.prev);
      })
      .then(pageInfo => {
        done();
      });
  }).timeout(10000);
});
