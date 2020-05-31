const Gasper = require('../lib/gasper');

const tar = require('tar-stream');
const tfs = require('tar-fs');

const assert = require('assert');

describe('Gasper', function() {

  it('should handle in stream with fixtures', function(done) {
    const fixtures = tfs.pack('./test/fixtures');

    const extract = tar.extract()
      .on('entry', function(header, stream, next) {
        stream.on('end', next);

        assert.ok(header.name.endsWith('.txt'));

        stream.resume();
      });

    new Gasper(fixtures, extract)
      .on('entry', function(header, stream) {
        if (header.type !== 'directory') {
          header.name = `${header.name}.txt`;
          stream.pipe(this.out.entry(header));
        } else {
          stream.end();
        }
      })
      .on('finish', function() {
        this.out.finalize();
      })
      .on('end', done)
      .start();
  });

  it('should be a source', function(done) {
    const fixtures = tfs.pack('./test/fixtures');

    const extract = tar.extract()
      .on('entry', function(header, stream, next) {
        stream.on('end', next);

        assert.ok(header.name.endsWith('.md'));

        stream.resume();
      });

    new Gasper(null, extract)
      .on('source', function() {
        this.out.entry({ name: '1.md' }, 'Hello');
        this.out.entry({ name: '2.md' }, 'World');
        this.out.finalize();
      })
      .on('end', done)
      .start();
  });

  it('souldn\'t be a source', function(done) {
    new Gasper()
      .removeAllListeners('error')
      .on('error', () => done())
      .start();
  })
});
