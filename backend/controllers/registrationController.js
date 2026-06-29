const Class = require('../models/Class');
const Registration = require('../models/Registration');

// @desc    Get all classes with status for a specific semester
// @route   GET /api/registration/classes?semester=1
// @access  Private
const getFreshClasses = async (req, res) => {
    try {
        const semester = req.query.semester;
        if (!semester) {
            return res.status(400).json({ message: 'Semester is required' });
        }

        const semesterNum = parseInt(semester, 10);
        const classes = await Class.find({ semester: semesterNum }).sort({ order: 1 });
        
        let foundOpenClass = false;
        
        const responseClasses = classes.map((cls) => {
            let status = 'closed'; // full, open, or closed
            
            if (cls.enrolledCount >= cls.capacity) {
                status = 'full';
            } else if (!foundOpenClass) {
                // The first non-full class in order is the open one
                status = 'open';
                foundOpenClass = true;
            }
            
            return {
                id: cls._id,
                name: cls.name,
                capacity: cls.capacity,
                enrolledCount: cls.enrolledCount,
                order: cls.order,
                status
            };
        });

        res.json(responseClasses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a student for a fresh class
// @route   POST /api/registration/fresh
// @access  Private
const registerFresh = async (req, res) => {
    try {
        const { classId, semester } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!classId || !semester) {
            return res.status(400).json({ message: 'Class ID and semester are required' });
        }

        const semesterNum = parseInt(semester, 10);

        // Check if user already registered for fresh registration
        const existingReg = await Registration.findOne({ user: userId, type: 'fresh' });
        if (existingReg) {
            return res.status(400).json({ message: 'User already completed fresh registration' });
        }

        // Check the class
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        if (targetClass.semester !== semesterNum) {
            return res.status(400).json({ message: 'Class semester mismatch' });
        }

        if (targetClass.enrolledCount >= targetClass.capacity) {
            return res.status(400).json({ message: 'Class is already full' });
        }

        // Check if it's the valid open class according to sequence
        const earlierClasses = await Class.find({ 
            semester: semesterNum, 
            order: { $lt: targetClass.order } 
        });
        
        const allEarlierFull = earlierClasses.every(c => c.enrolledCount >= c.capacity);
        if (!allEarlierFull) {
            return res.status(400).json({ message: 'You must fill earlier sequential classes first' });
        }

        // Atomic check and increment using findOneAndUpdate to prevent race conditions
        const updatedClass = await Class.findOneAndUpdate(
            { _id: classId, enrolledCount: { $lt: targetClass.capacity } },
            { $inc: { enrolledCount: 1 } },
            { new: true }
        );

        if (!updatedClass) {
            return res.status(400).json({ message: 'Class filled up while processing' });
        }

        // Create the registration
        const registration = await Registration.create({
            user: userId,
            type: 'fresh',
            semester: semesterNum,
            class: classId,
            registeredBy: 'self'
        });

        res.status(201).json({
            message: 'Registered successfully',
            registration
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a student for a semester department
// @route   POST /api/registration/semester
// @access  Private
const registerSemester = async (req, res) => {
    try {
        const { department, year, semester, className, studentId, studentName, faculty } = req.body;
        const userId = req.user.id;

        if (!department || !year || !semester || !className || !studentId || !studentName) {
            return res.status(400).json({ message: 'Department, year, semester, class, studentId and studentName are required' });
        }

        if (studentName.trim().split(/\s+/).length !== 3) {
            return res.status(400).json({ message: 'Student full name must consist of exactly three words' });
        }

        const semesterNum = parseInt(semester, 10);

        // Check if student already registered for the same department-year-semester
        const existingReg = await Registration.findOne({
            type: 'semester',
            department,
            year,
            semester: semesterNum,
            studentId
        });
        if (existingReg) {
            return res.status(400).json({ message: 'User already registered for this class and term' });
        }

        const registration = await Registration.create({
            user: userId,
            type: 'semester',
            semester: semesterNum,
            department,
            year,
            className,
            studentId,
            studentName,
            faculty: faculty || undefined,
            registeredBy: 'self'
        });

        res.status(201).json({
            message: 'Registered successfully',
            registration
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students registered for a specific department/year/semester
// @route   GET /api/registration/students
// @access  Private
const getRegisteredStudents = async (req, res) => {
    try {
        const { department, year, semester, className } = req.query;
        if (!department || !year || !semester || !className) {
            return res.status(400).json({ message: 'department, year, semester, className query params are required' });
        }

        const semesterNum = parseInt(semester, 10);

        const registrations = await Registration.find({
            type: 'semester',
            department,
            year,
            semester: semesterNum,
            className
        }).select('studentId studentName faculty department year semester className createdAt');

        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFreshClasses,
    registerFresh,
    registerSemester,
    getRegisteredStudents
};
