const request = require('supertest')
    , fs = require('fs')
    , path = require('path')
    , config = require('./config')
    , should = require('should')
    , cheerio = require('cheerio');

const baseURL = config.baseURL;

describe('Exercise 4. Upload', function(){
  describe("on /GET upload", function(){
  
    it('should return a form with proper field types and names', function(done){ 
      request(baseURL)
      .get('/upload')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .end(function(err, res){
        if(err) return done(err);

        const $ = cheerio.load(res.text);
        const $uploadForm = $('form#upload-form');
        $uploadForm.length.should.equal(1);
        $uploadForm.find('input[type="file"][name="file"]').length.should.equal(1);
        $uploadForm.find('input[type="submit"][name="submit"]').length.should.equal(1);
        if($uploadForm.attr('action')){
          const action = $uploadForm.attr('action').trim();
          action.should.match(function(s) { return s === '' || s === '/upload' || s === '/upload/'  })
        }
        done();
      });
    });
  });

  describe("on /POST upload", function(){
    before(function(){
      const lepath = path.resolve(config.projectRoot,'./NodeStaticFiles/upload-test.jpg')
      if(fs.existsSync(lepath)){
        fs.unlinkSync(lepath);
      }     
    });

    after(function(){
      console.log(config.projectRoot)
      const lepath = path.resolve(config.projectRoot,'./NodeStaticFiles/upload-test.jpg')
      if(fs.existsSync(lepath)){
        fs.unlinkSync(lepath);
      }     
    });

    it('should successfuly upload an image file ', function(done){
      request(baseURL)
      .post('/upload')
      .set('Accept', 'application/json')
      .attach('file', path.resolve(__dirname,'./fixtures/upload-test.jpg'))
      .expect(302)
      .end(function(err, res){
        if (err) {
          return done(err); }
        done()
      });
    });

    it('the uploaded image file should be in the root dir', function(done){
      request(baseURL)
      .get('/explore')
      .end(function(err, res){
        //new file should be listed in the root dir
        res.text.should.containEql('file/' + 'upload-test.jpg')
        if (err) {
          return done(err); }
        done()
      });
    });
  });
});
