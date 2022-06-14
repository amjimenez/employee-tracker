class Employee {
    constructor(id, firstName, lastName, department, title, salary, manager) {

        // validate id
        if (Number.isNaN(id)) {
            console.error('Employee ID must be a number');
        }

        // validate first name
        if (firstName.trim() == '' || firstName == null) {
            console.error('Employee first name is required');
        }

        // validate last name
        if (lastName.trim() == '' || lastName == null) {
            console.error('Employee last name is required');
        }

        this.id = id;
        this.firstName = firstName
        this.lastName = lastName
        this.department = department
        this.title = title
        this.salary = salary
        this.manager = manager
    }

    getId() {
        return this.id;
    }

    getFirstName() {
        return this.firstName;
    }

    getLastName() {
        return this.lastName;
    }

    getDepartment() {
        return this.department
    }

    getManager() {
        return this.manager
    }

    getRole() {
        return 'Employee';
    }

    getSalary() {
        return this.salary
    }

    getJobTitle() {
        return this.title
    }
}

module.exports = Employee;