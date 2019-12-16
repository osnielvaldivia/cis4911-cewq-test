// Test environment
process.env.NODE_ENV = 'test';

// Imports
const faker = require('faker');
const { expect } = require('chai');
const mongoose = require('mongoose');
const request = require('supertest');

// Mongoose models
const User = require('../models/User');
const roles = require('../models/roles');

// Import server
const app = require('../server');

const owner = {
  companyId: null,
};

// Parent test suite
describe('Company Test Suite', () => {
  // Generate random owner
  const owner = {
    companyId: null,
    header: {
      'x-auth-token': null,
      'Content-Type': 'application/json',
    },
    name: faker.name.findName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
  };

  // Generate random company
  const company = {
    name: faker.commerce.productName(),
  };

  // Clear and setup database
  describe('Setup Database', () => {
    it('should empty database', () => {
      return mongoose.connection.dropDatabase().then(res => {
        expect(res).to.be.true;
      });
    });

    // Set all user entities here
    describe('Users Setup', () => {
      // Owner
      describe('Register owner', () => {
        it('should register an owner', () => {
          const body = {
            name: owner.name,
            password: owner.password,
            email: owner.email,
          };

          return request(app)
            .post('/api/users')
            .send(body)
            .expect('content-type', 'application/json; charset=utf-8')
            .expect(200)
            .then(res => {
              expect(res.body.token).to.not.be.null;
              owner.header['x-auth-token'] = res.body.token;
            });
        });

        it('should change user type to owner', () => {
          return User.findOneAndUpdate(
            { email: owner.email },
            { role: roles.OWNER },
            (err, doc) => {
              expect(doc).to.not.be.null;
            }
          );
        });
      });
    });
  });

  // Test suite for post route
  describe('/POST', () => {
    describe('Test body validation', () => {
      it('should return errors array', () => {
        const body = {
          name: '',
        };
        return request(app)
          .post('/api/company')
          .send(body)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(400)
          .then(res => {
            expect(res.body.errors).to.not.be.empty;
            expect(res.body.errors[0].msg).to.be.equal(
              'Company name is required'
            );
          });
      });
    });

    describe('Create company', () => {
      it('should create a company', () => {
        const body = {
          name: company.name,
        };

        return request(app)
          .post('/api/company')
          .send(body)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(200)
          .then(res => {
            expect(res.body.employees).to.be.empty;
            expect(res.body.admins).to.be.empty;
            expect(res.body.tickets).to.be.empty;
            expect(res.body._id).to.not.be.null;
            expect(res.body.name).to.be.equal(body['name']);
            expect(res.body.owner).to.not.be.null;
            expect(res.body.date).to.not.be.null;

            companyId = res.body._id;
          });
      });
    });

    describe('Test duplicate company', () => {
      it('should not create a duplicate company', () => {
        const body = {
          name: company.name,
        };

        return request(app)
          .post('/api/company')
          .send(body)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.be.equal('Company already exists');
          });
      });
    });

    describe('Test one company restriction', () => {
      it('should not let owner have more than one company', () => {
        const body = {
          name: 'NameThatDoesNotExist',
        };

        return request(app)
          .post('/api/company')
          .send(body)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.be.equal('Owner already has a company');
          });
      });
    });
  });

  // Test suite for get route
  describe('/GET', () => {
    describe('Try to get invalid company', () => {
      it('should not be able to get a company', () => {
        const id = mongoose.Types.ObjectId();

        return request(app)
          .get(`/api/company/${id}`)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(400)
          .then(res => {
            expect(res.body.msg).to.be.equal('Company not found');
          });
      });
    });

    describe('Get company', () => {
      it('should get a company', () => {
        return request(app)
          .get(`/api/company/${companyId}`)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(200)
          .then(res => {
            expect(res.body._id).to.be.equal(companyId);
            expect(res.body.name).to.be.equal(company.name);
          });
      });
    });
  });

  // Test suite for company teardown
  describe('Teardown Company', () => {
    describe('Delete test company', () => {
      it('should delete the test company', () => {
        return request(app)
          .del(`/api/company/${companyId}`)
          .set(owner.header)
          .expect('content-type', 'application/json; charset=utf-8')
          .expect(200)
          .then(res => {
            expect(res.body.msg).to.be.equal('Company deleted');
          });
      });
    });
  });

  describe('Teardown Database', () => {
    it('should empty database', () => {
      return mongoose.connection.dropDatabase().then(res => {
        expect(res).to.be.true;
      });
    });
  });
});
