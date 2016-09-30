// node-packages, requires mocha
var assert = require('assert'),
  Q = require('q'),
  _ = require('lodash');
// FTPS package from index.js
var FTPS = require('../index');

describe('FTPS', function() {
  describe('#initialize()', function () {
    it('should properly set default options', function () {
      // fake options to avoid throwing an error
      var fakeOptions = {
        host:'foobar.com',
        username:'foo',
        requiresPassword:false
      };
      // expectedDefaults as configured in initialize
      var expectedDefaults = {
        host: fakeOptions.host,
        username: fakeOptions.username,
        password: '',
        escape: true,
        retries: 1,
        timeout: 10,
        retryInterval: 5,
        retryIntervalMultiplier: 1,
        requiresPassword: fakeOptions.requiresPassword,
        autoConfirm: false,
        cwd: '',
        additionalLftpCommands: ""
      };
      // initialize and grab the options from FTPS
      var ftpsDefaultOptions = new FTPS(fakeOptions).options;
      // assert that the defaultOptions are as expected
      assert.equal(true, _.isEqual(ftpsDefaultOptions, expectedDefaults));
    });
    it('should throw an error when host is not set', function() {
      try {
        var ftpsWithoutPassedOptions = new FTPS();
      }
      catch (ex) {
        assert.equal("Error: You need to set a host.", ex);
      }
    });
    it('should throw an error when username is not set', function() {
      var fakeOptionsNoUsername = {
        host:'foobar'
      };
      try {
        var ftpsWithoutUsername = new FTPS(fakeOptionsNoUsername);
      }
      catch (ex) {
        assert.equal("Error: You need to set an username.", ex);
      }
    });
    it('should throw an error when password is not set & requiresPassword is true', function() {
      var fakeOptionsWithoutPassword = {
        host:'foobar',
        username:'foo'
      };
      try {
        var ftpsWithoutPassword = new FTPS(fakeOptionsWithoutPassword);
      }
      catch (ex) {
        assert.equal("Error: You need to set a password.", ex);
      }
    });
    it('should not throw error when password is not set & requiresPassword is false', function() {
      var fakeOptionsRequiresPasswordFalse = {
        host:'foobar',
        username:'foo',
        requiresPassword:false
      };
      var ftpsRequiresPasswordFalse= new FTPS(fakeOptionsRequiresPasswordFalse);
    });
    it('should properly set the protocol', function() {
      var setProtocol = 'SFTP';
      var fakeOptionsWithProtocol = {
        host:'foobar',
        username:'foo',
        requiresPassword:false,
        protocol:setProtocol
      };
      var ftpsWithProtocolOptions = new FTPS(fakeOptionsWithProtocol).options;
      assert.equal(setProtocol, ftpsWithProtocolOptions.protocol);
    });
    it('should raise error when protocol not set to string', function() {
      var setProtocol = 111;
      var fakeOptionsWithProtocol = {
        host:'foobar',
        username:'foo',
        requiresPassword:false,
        protocol:setProtocol
      };
      try {
        var ftpsWithProtocolOptions = new FTPS(fakeOptionsWithProtocol).options;
      }
      catch (ex) {
        assert.equal("Error: Protocol needs to be of type string.", ex);
      }
    });
  });
  describe('#rm()', function () {
    beforeEach(function() {
      var fakeOptions = {
        host:'foobar.com',
        username:'foo',
        requiresPassword:false
      };
      this.ftps = new FTPS(fakeOptions);
    });
    it('should not have TypeError: Cannot read property \'escape\' of undefined', function () {
      this.ftps.rm('foobar.txt');
    });
  });
  describe('#rmdir()', function () {
    beforeEach(function() {
      var fakeOptions = {
        host:'foobar.com',
        username:'foo',
        requiresPassword:false
      };
      this.ftps = new FTPS(fakeOptions);
    });
    it('should not have TypeError: Cannot read property \'escape\' of undefined', function () {
      this.ftps.rmdir('foo');
    });
  });
  describe('#exec()', function () {
    beforeEach(function() {
      // initialize multiple ftps connections for testing purposes
      var fakeOptions = {
        host: 'foo',
        username: 'fake',
        password: 'fake',
        port: '11111',
        protocol: 'sftp'
      };
      // arbitrarily picked 4, the on 'exit' bug only occurs when one LFTP
      // exit causes other clients to prematurely terminate
      this.ftps = new FTPS(fakeOptions);
      this.ftps2 = new FTPS(fakeOptions);
      this.ftps3 = new FTPS(fakeOptions);
      this.ftps4 = new FTPS(fakeOptions);
    });
    it('should send error for each misconfigured ftps clients', function(done) {
      // run ninvoke to async run all ftps connections and perform a ls that
      // is expected to fail
      promises = [];
      promises.push(Q.ninvoke(this.ftps.ls(), 'exec'));
      promises.push(Q.ninvoke(this.ftps2.ls(), 'exec'));
      promises.push(Q.ninvoke(this.ftps3.ls(), 'exec'));
      promises.push(Q.ninvoke(this.ftps4.ls(), 'exec'));
      Q.all(promises).then(function(res) {
        _.forEach(res, function(value) {
          // assert that each one has a non-null error
          assert.notEqual(value.error, null);
        });
        done();
      }).fail(function(err) {
        // propagate error to mocha on failure
        done(err);
      })
    });
  });
});
