const EventEmitter = require('events');

const tar = require('tar-stream');

class Gasper extends EventEmitter {

  out = tar.pack()
    .on('end', () => {
      this.emit('end');
    }).on('error', (error) => {
      this.emit('error', error);
    });

  constructor(_in, _out = process.stdout) {
    super({ captureRejections: true });

    this._in = _in;
    this._out = _out;

    this.out.pipe(_out);

    this.on('error', this.panic);
  }

  log(message) {
    console.error(message);
  }

  panic(error) {
    console.error(error);
    process.exit(1);
  }

  start(options = {}) {
    if (this._in) {
      const extract = tar.extract();

      extract
        .on('entry', (header, stream, next) => {
          if (!options.parallel) {
            stream.on('end', next);
          } else {
            next();
          }

          this.emit('entry', header, stream);
        }).on('finish', () => {
          this.emit('finish');
        }).on('error', (error) => {
          this.emit('error', error);
        });

      this._in.pipe(extract);
    } else {
      if (this.listenerCount('source') > 0) {
        this.emit('source')
      } else {
        this.emit('error', new Error('There are no source listeners'));
      }
    }
  }
}

module.exports = Gasper;
