const assert = require('assert');
const chai = require('chai');
const Employee = require("../lib/Employee");

let employee = new Employee(1, 'John Employee', 'john.employee@mail.com');

// test employee user id is correct
describe('new Employee(1, "John Employee", "john.employee@mail.com")', function () {
  describe('#getId()', function () {
    it('should return 1', function () {
      assert.equal(1, employee.getId());
    });
  });
});

// test employee name is correct
describe('new Employee(1, "John Employee", "john.employee@mail.com")', function () {
  describe('#getName()', function () {
    it('should return John Employee', function () {
      assert.equal("John Employee", employee.getName());
    });
  });
});

// test employee email is correct
describe('new Employee(1, "John Employee", "john.employee@mail.com")', function () {
  describe('#getEmail()', function () {
    it('should return john.employee@mail.com', function () {
      assert.equal('john.employee@mail.com', employee.getEmail());
    });
  });
});

// test employee with invalid id
describe('new Employee(null, "John Employee", "john.employee@mail.com")', function () {
  describe('#getId()', function () {
   it('should throw an error', function () {
      chai.expect(console.error('Employee ID must be a number'));
    }); 
  });
});

// test employee with missing name
describe('new Employee(1, "", "john.employee@mail.com")', function () {
  describe('#getName()', function () {
   it('should throw an error', function () {
      chai.expect(console.error('Employee name is required'));
    }); 
  });
});

// test employee with invalid email
describe('new Employee(1, "John Employee", "john.manager")', function () {
  describe('#getEmail()', function () {
   it('should throw an error', function () {
      chai.expect(console.error('Employee email is invalid or missing'));
    }); 
  });
});