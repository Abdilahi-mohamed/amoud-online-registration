const Registration = require('../models/Registration');
const Class = require('../models/Class');

const FACULTIES = [
    {
        name: 'ICT Faculty',
        departments: ['Cyber Security', 'ICT (Pure ICT)', 'Software Engineering', 'Data Analysis', 'Business IT']
    },
    {
        name: 'Business Faculty',
        departments: ['Accounting', 'Project Planning']
    },
    {
        name: 'Education Faculty',
        departments: ['Primary Education', 'Secondary Education', 'Special Education', 'Educational Psychology', 'Curriculum Development']
    },
    {
        name: 'Agriculture Faculty',
        departments: ['Crop Science', 'Animal Science', 'Agricultural Engineering', 'Soil Science', 'Horticulture']
    },
    {
        name: 'Medicine Faculty',
        departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology', 'Internal Medicine']
    },
    {
        name: 'Engineering Faculty',
        departments: ['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering', 'Computer Engineering']
    }
];

const getFacultyDashboard = async (req, res) => {
    try {
        // Get department counts for semester registrations
        const departmentCounts = await Registration.aggregate([
            { $match: { type: 'semester' } },
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        const countsByDepartment = departmentCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Get all classes with their enrolled counts
        const classes = await Class.find().populate('enrolledCount').sort({ semester: 1, order: 1 });

        // Group classes by department (assuming department is derived from class name or additional logic)
        // For now, we'll include all classes under a general 'Classes' section or map them appropriately
        // Since departments are listed, we can add a 'classes' array to each department

        const facultyData = FACULTIES.map((faculty) => ({
            name: faculty.name,
            departments: faculty.departments.map((department) => ({
                name: department,
                registeredStudents: countsByDepartment[department] || 0,
                classes: [] // We'll populate this if needed
            }))
        }));

        // Add classes information separately or integrate
        const classData = classes.map((cls) => ({
            id: cls._id,
            name: cls.name,
            capacity: cls.capacity,
            enrolledCount: cls.enrolledCount,
            semester: cls.semester
        }));

        res.json({ faculties: facultyData, classes: classData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFacultyDashboard };
