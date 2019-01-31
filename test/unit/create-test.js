import sinon from 'sinon';
import {assert} from 'chai';
import any from '@travi/any';
import * as clientFactory from '../../src/github-client-factory';
import create from '../../src/create';

suite('creation', () => {
  let sandbox;

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(clientFactory, 'factory');
  });

  teardown(() => sandbox.restore());

  suite('for user', () => {
    test('that the repository is created for the provided user account', () => {
      const name = any.word();
      const createForAuthenticatedUser = sinon.stub();
      const client = {repos: {createForAuthenticatedUser}};
      clientFactory.factory.returns(client);

      create(name, 'Public');

      assert.calledWith(createForAuthenticatedUser, {name, private: false});
    });

    test('that the repository is created as private when visibility is `Privage`', () => {
      const name = any.word();
      const createForAuthenticatedUser = sinon.stub();
      const client = {repos: {createForAuthenticatedUser}};
      clientFactory.factory.returns(client);

      create(name, 'Private');

      assert.calledWith(createForAuthenticatedUser, {name, private: true});
    });
  });
});
