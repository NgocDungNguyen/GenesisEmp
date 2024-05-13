// Function to get the current week number
function getWeekNumber() {
    const today = new Date();
    const onejan = new Date(today.getFullYear(), 0, 1);
    const millisecsInDay = 86400000;
    const weekNumber = Math.ceil((((today.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
    console.log("Current week:", weekNumber);
    return weekNumber;
}

// Function to get the date range for a given week number
function getDateRangeOfWeek(weekNo) {
    const d1 = new Date(new Date().getFullYear(), 0, 1);
    const numOfdaysPastSinceLastMonday = d1.getDay() - 1;
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    d1.setDate(d1.getDate() + (7 * (weekNo - 1)));
    const rangeIsFrom = (d1.getMonth() + 1) + "/" + d1.getDate();
    const d2 = new Date(d1);
    d2.setDate(d1.getDate() + 6);
    const rangeIsTo = (d2.getMonth() + 1) + "/" + d2.getDate();
    return rangeIsFrom + "-" + rangeIsTo;
}

// Function to get specific dates for a week number
function getDatesOfWeek(weekNo) {
    const d1 = new Date(new Date().getFullYear(), 0, 1);
    const numOfdaysPastSinceLastMonday = d1.getDay() - 1;
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    d1.setDate(d1.getDate() + (7 * (weekNo - 1)));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(d1);
        date.setDate(d1.getDate() + i);
        dates.push((date.getMonth() + 1) + "/" + date.getDate());
    }
    return dates;
}

$(document).ready(function() {
    let isAdminLoggedIn = false;
    let selectedWeek = getWeekNumber();

    populateWeekOptions();
    $('#weekSelect').val(selectedWeek);
    fetchScheduleData(selectedWeek);

    function populateWeekOptions() {
        const currentWeek = getWeekNumber();
        for (let i = 1; i <= currentWeek; i++) {
            const dateRange = getDateRangeOfWeek(i);
            $('#weekSelect').append(`<option value="${i}">Week ${i} (${dateRange})</option>`);
        }
    }

    $('#registerForm').submit(function(event) {
        event.preventDefault();

        const shifts = getSelectedShifts();
        console.log("Shifts being submitted:", shifts);

        const formData = {
            name: $('#fullName').val(),
            dateOfBirth: $('#dob').val(),
            week: parseInt($('#weekSelect').val()), // Ensure week is an integer
            shifts: shifts
        };
        console.log("FormData being sent:", formData);

        $.ajax({
            type: 'POST',
            url: '/api/employees',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(data) {
                alert('Submission successful!');
                fetchScheduleData(selectedWeek);
            },
            error: function(err) {
                if (err.responseJSON && err.responseJSON.message) {
                    console.error('Submission failed:', err.responseJSON.message);
                } else {
                    console.error('Submission failed:', err);
                }
            }
        });
    });

    function getSelectedShifts() {
        const shifts = [];
        $('input[name="workSchedule"]:checked').each(function() {
            const shiftId = $(this).attr('id');
            const day = shiftId.replace(/(Morning|Afternoon|Evening|Night)$/, '');
            const shift = shiftId.match(/(Morning|Afternoon|Evening|Night)$/)[0];
            const note = $('#note').val();
            shifts.push({ day: day.charAt(0).toUpperCase() + day.slice(1), shift: shift, note: note });
        });
        return shifts;
    }

    $('#adminLogin').click(showAdminLoginModal);

    $('#adminLoginForm').submit(function(event) {
        event.preventDefault();

        const username = $('#adminUsername').val();
        const password = $('#adminPassword').val();

        $.ajax({
            url: '/api/admin/login',
            method: 'POST',
            data: JSON.stringify({ username, password }),
            contentType: 'application/json',
            success: function(data) {
                if (data.success) {
                    isAdminLoggedIn = true;
                    $('#adminLoginModal').hide();
                    $('#adminInterface').show();
                    $('#editModeButton, #saveButton, #cancelButton').show();
                    fetchScheduleData(selectedWeek);
                } else {
                    alert('Tài khoản hoặc mật khẩu không đúng');
                }
            },
            error: function(error) {
                if (error.status === 401) {
                    alert(error.responseJSON.message);
                } else {
                    console.error('Lỗi khi đăng nhập admin:', error);
                }
            }
        });
    });

    function showAdminLoginModal() {
        $('#adminLoginModal').show();
    }

    $('.close').click(function() {
        $('#adminLoginModal').hide();
    });

    function fetchScheduleData(weekNumber) {
        console.log("Fetching schedule data for week:", weekNumber);

        $.ajax({
            url: '/api/schedules/' + weekNumber,
            method: 'GET',
            success: function(scheduleData) {
                console.log("Schedule Data for week", weekNumber, ":", scheduleData);
                renderScheduleTable(scheduleData, weekNumber);
            },
            error: function(error) {
                console.error('Lỗi khi lấy dữ liệu thời gian biểu:', error);
            }
        });
    }

    function renderScheduleTable(scheduleData, weekNumber) {
        const $tableBody = $('#scheduleTable tbody');
        const $tableHead = $('#scheduleTable thead tr');
        $tableBody.empty();
        $tableHead.empty();

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dates = getDatesOfWeek(weekNumber);
        $tableHead.append('<th>Tên nhân viên</th>');
        days.forEach(function(day, index) {
            $tableHead.append(`<th>${day} (${dates[index]})</th>`);
        });
        $tableHead.append('<th>Ghi chú</th>');

        if (scheduleData.length > 0) {
            scheduleData.forEach(function(schedule) {
                const $row = $('<tr>');
                const employee = schedule.employee;

                $row.append($('<td>').text(employee.name));

                days.forEach(function(day) {
                    const shifts = schedule.shifts.filter(shift => shift.day.toLowerCase() === day.toLowerCase());
                    const $cell = $('<td>').addClass('shift-cell');

                    shifts.forEach(function(shift) {
                        const $shiftElement = $('<div>')
                            .text(formatShiftDetails(shift.shift))
                            .addClass('shift')
                            .addClass(shift.shift.toLowerCase())
                            .attr('contenteditable', isAdminLoggedIn)
                            .attr('data-shift-id', shift._id);

                        if (isAdminLoggedIn) {
                            const $removeShiftButton = $('<button>').text('x').addClass('remove-shift').click(function() {
                                removeShift(employee._id, shift._id);
                            });
                            $shiftElement.append($removeShiftButton);
                        }

                        $cell.append($shiftElement);
                    });

                    if (isAdminLoggedIn) {
                        const $addShiftButton = $('<button>').text('+').addClass('add-shift').click(function() {
                            addShift(employee._id, day);
                        });
                        $cell.append($addShiftButton);
                    }

                    $row.append($cell);
                });

                const uniqueNotes = Array.from(new Set(schedule.shifts.map(shift => shift.note).filter(note => note)));
                $row.append($('<td>').text(uniqueNotes.join(', ')));

                $tableBody.append($row);
            });
        } else {
            $tableBody.append($('<tr><td colspan="9">Không có dữ liệu cho tuần này.</td></tr>'));
        }
    }

    function formatShiftDetails(shift) {
        switch (shift) {
            case 'Morning': return 'Sáng (8:30-12:30)';
            case 'Afternoon': return 'Chiều (12:30-17:00)';
            case 'Evening': return 'Tối (17:00-22:00)';
            case 'Night': return 'Đêm (22:00-1:30)';
            default: return shift;
        }
    }

    $('#editModeButton').click(function() {
        const isEditMode = !$(this).data('isEditMode');
        $(this).data('isEditMode', isEditMode);

        $('#scheduleTable .shift').attr('contenteditable', isEditMode);
        $('#saveButton, #cancelButton').toggle(isEditMode);
        $('.add-shift, .remove-shift').toggle(isEditMode);
        $(this).text(isEditMode ? 'Hủy chỉnh sửa' : 'Chỉnh sửa');
    });

    function getUpdatedSchedules() {
        const updatedSchedules = [];
        $('#scheduleTable tbody tr').each(function() {
            const employee = {
                name: $(this).find('td:first').text(),
                shifts: []
            };

            $(this).find('td').each(function(index) {
                if (index > 0 && index < 8) {
                    const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index - 1];
                    const shifts = $(this).find('.shift').map(function() {
                        return {
                            day,
                            shift: $(this).text(),
                            _id: $(this).attr('data-shift-id')
                        };
                    }).get();

                    employee.shifts = employee.shifts.concat(shifts);
                }
            });

            updatedSchedules.push(employee);
        });
        return updatedSchedules;
    }

    // Add shift function
    function addShift(employeeId, day) {
        const newShift = prompt("Enter new shift (Morning, Afternoon, Evening, Night):");
        if (newShift) {
            $.ajax({
                url: `/api/employees/${employeeId}/shifts`,
                method: 'POST',
                data: JSON.stringify({ day, shift: newShift, note: "" }),
                contentType: 'application/json',
                success: function(data) {
                    alert('Ca làm mới được thêm thành công');
                    fetchScheduleData(selectedWeek);
                },
                error: function(error) {
                    console.error('Lỗi khi thêm ca làm:', error);
                }
            });
        }
    }

    // Remove shift function
    function removeShift(employeeId, shiftId) {
        $.ajax({
            url: `/api/employees/${employeeId}/shifts/${shiftId}`,
            method: 'DELETE',
            success: function(data) {
                alert('Ca làm đã được xóa thành công');
                fetchScheduleData(selectedWeek);
            },
            error: function(error) {
                console.error('Lỗi khi xóa ca làm:', error);
            }
        });
    }

    // Update schedules function
    $('#saveButton').click(function() {
        if (isAdminLoggedIn) {
            const updatedSchedules = getUpdatedSchedules();

            $.ajax({
                url: '/api/schedules/' + selectedWeek,
                method: 'PUT',
                data: JSON.stringify(updatedSchedules),
                contentType: 'application/json',
                success: function(data) {
                    alert('Cập nhật thành công');
                    fetchScheduleData(selectedWeek);
                },
                error: function(error) {
                    console.error('Lỗi khi cập nhật ca làm:', error);
                }
            });
        } else {
            alert('Bạn cần đăng nhập để thực hiện thay đổi');
        }
    });

    $('#weekSelect').change(function() {
        const weekNumber = $(this).val();
        selectedWeek = weekNumber;
        fetchScheduleData(weekNumber);
    });

    fetchScheduleData(selectedWeek);
});
