
const { crawl } = require('../../../api/controllers/crawler')

describe('Test', () => {
  it('test crawl beauty index', function(done){
    const mockReq = {
      crawlTarget: '',
    };
    const mockRes = {
      json: (result) => {
        console.warn('json result', result);
        done(!result);
      },
    };

    const mockNext = (err) => {
      console.warn('err', err)
      done(err);
    };

    crawl(mockReq, mockRes, mockNext);
  })  
})