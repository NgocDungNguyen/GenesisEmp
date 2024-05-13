const express = require('express');
const router = express.Router();
const Employee = require('../models/employee.model');
const Schedule = require('../models/schedule.model');

// Utility function to get the current week number
function getWeekNumber() {
    const today = new Date();
    const oneJan = new Date(today.getFullYear(), 0, 1);
    const days = Math.floor((today - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + oneJan.getDay() + 1) / 7);
}

// Create a new employee and associated schedule
router.post('/employees', async (req, res) => {
    console.log("Received body:", req.body);
    const { name, dateOfBirth, week, shifts } = req.body;

    try {
        const employee = new Employee({
            name,
            dateOfBirth,
            shifts: shifts.map(shift => ({
                day: shift.day,
                shift: shift.shift,
                note: shift.note || ''
            }))
        });

        const newEmployee = await employee.save();

        const schedule = new Schedule({
            employee: newEmployee._id,
            week: parseInt(week),
            shifts: shifts
        });

        await schedule.save();

        res.status(201).json(newEmployee);
    } catch (err) {
        console.error("Error creating employee:", err);
        res.status(400).json({ message: err.message });
    }
});

// Update an employee's shifts
router.put('/employees/:id', async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    shifts: req.body.shifts.map(shift => ({
                        day: shift.day,
                        shift: shift.shift,
                        note: shift.note || ''
                    }))
                }
            },
            { new: true }
        );
        res.json(updatedEmployee);
    } catch (err) {
        console.error("Error updating employee shifts:", err);
        res.status(400).json({ message: err.message });
    }
});

// Admin login
router.post('/admin/login', (req, res) => {
    console.log('Admin login attempt received!');
    const { username, password } = req.body;

    if (username === 'admin' && password === '123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// Fetch schedules by week
router.get('/schedules/:week', async (req, res) => {
    try {
        const week = parseInt(req.params.week);
        console.log("Received request for week:", week);
        const schedules = await Schedule.find({ week }).populate('employee');
        res.json(schedules);
    } catch (error) {
        console.error("Error fetching schedules:", error);
        res.status(500).json({ message: 'Lỗi khi lấy dữ liệu lịch làm việc', error: error.message });
    }
});

// Create a new schedule
router.post('/schedules', async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        await newSchedule.save();
        res.status(201).json({ message: 'Lịch làm việc mới được tạo thành công' });
    } catch (error) {
        console.error("Error creating schedule:", error);
        res.status(500).json({ message: 'Lỗi khi tạo lịch làm việc', error: error.message });
    }
});

// Update a schedule
router.put('/schedules/:week', async (req, res) => {
    try {
        const week = parseInt(req.params.week);
        const updatedSchedules = req.body;

        // Find schedules by week and update them
        const schedules = await Schedule.find({ week });
        if (!schedules.length) {
            return res.status(404).json({ message: 'Lịch làm việc không được tìm thấy' });
        }

        for (const schedule of schedules) {
            schedule.shifts = updatedSchedules.find(sch => sch.employee.name === schedule.employee.name)?.shifts || [];
            await schedule.save();
        }

        res.json({ message: 'Lịch làm việc được cập nhật thành công' });
    } catch (error) {
        console.error("Error updating schedule:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật lịch làm việc', error: error.message });
    }
});

// Delete a schedule
router.delete('/schedules/:id', async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Lịch làm việc được xóa thành công' });
    } catch (error) {
        console.error("Error deleting schedule:", error);
        res.status(500).json({ message: 'Lỗi khi xóa lịch làm việc', error: error.message });
    }
});

// Add a new shift to an employee
router.post('/employees/:id/shifts', async (req, res) => {
    try {
        const { id } = req.params;
        const { day, shift, note } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.shifts.push({ day, shift, note });
        await employee.save();

        const week = getWeekNumber();
        let schedule = await Schedule.findOne({ employee: id, week });
        if (!schedule) {
            schedule = new Schedule({ employee: id, week, shifts: [] });
        }
        schedule.shifts.push({ day, shift, note });
        await schedule.save();

        res.status(201).json({ message: 'Shift added successfully' });
    } catch (error) {
        console.error('Error adding shift:', error);
        res.status(500).json({ message: 'Error adding shift', error: error.message });
    }
});

// Delete a shift
router.delete('/employees/:employeeId/shifts/:shiftId', async (req, res) => {
    try {
        const { employeeId, shiftId } = req.params;
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const shiftIndex = employee.shifts.findIndex(shift => shift._id.toString() === shiftId);
        if (shiftIndex === -1) {
            return res.status(404).json({ message: 'Shift not found in employee record' });
        }

        employee.shifts.splice(shiftIndex, 1);
        await employee.save();

        res.json({ message: 'Shift removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing shift', error: error.message });
    }
});

module.exports = router;