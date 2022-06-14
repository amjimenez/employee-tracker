class Role {
    constructor(id, title, department, salary) {
        this.id = id
        this.title = title
        this.department = department
        this.salary = salary
    }

    getId() {
        return this.id
    }

    getDepartment() {
        return this.department
    }

    getSalary() {
        return this.salary
    }

    getTitle() {
        return this.title
    }
}

module.exports = Role