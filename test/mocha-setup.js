import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

sinon.assert.expose(chai.assert, {prefix: ''});
chai.use(chaiAsPromised);

process.on('unhandledRejection', reason => {
  throw reason;
});
