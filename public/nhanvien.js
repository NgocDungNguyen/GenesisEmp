$(document).ready(function() {
    // Fetch and render employee data on page load
    fetchNhanvienData();

    // Add employee form submission
    $('#nhanvienForm').submit(function(event) {
        event.preventDefault();
        addNhanvien();
    });

    // Function to add a new employee row
    function addNhanvien() {
        const nhanvienName = $('#nhanvienName').val().trim();
        const nhanvienDesk = $('#nhanvienDesk').is(':checked') ? 'Yes' : 'No';

        if (nhanvienName === "") {
            alert("Tên Nhân Viên không được để trống.");
            return;
        }

        const newRow = `
            <tr>
                <td>${nhanvienName}</td>
                <td><input type="checkbox" ${nhanvienDesk === 'Yes' ? 'checked' : ''}></td>
                <td>${generateOptions('gone')}</td>
                <td>${generateOptions('gum')}</td>
                <td>${generateOptions('hns')}</td>
                <td>${generateOptions('am')}</td>
                <td>${generateOptions('ngai1')}</td>
                <td>${generateOptions('ngai2')}</td>
                <td>${generateOptions('chd')}</td>
                <td>${generateOptions('rrlm')}</td>
                <td>${generateRegistrationOptions()}</td>
                <td><button class="btn delete-btn">Xóa</button></td>
            </tr>
        `;

        $('#nhanvienTable tbody').append(newRow);
        $('#nhanvienName').val('');
        $('#nhanvienDesk').prop('checked', false);
        saveNhanvienData();
    }

    // Function to generate role options
    function generateOptions(role) {
        return `
            <label><input type="checkbox" name="${role}-flow"> Flow</label><br>
            <label><input type="checkbox" name="${role}-dien"> Diễn</label><br>
            <label><input type="checkbox" name="${role}-dj"> DJ</label>
        `;
    }

    // Function to generate registration options
    function generateRegistrationOptions() {
        return `
            <label><input type="radio" name="registration" value="Đã đki làm"> Đã đki làm</label><br>
            <label><input type="radio" name="registration" value="Chưa đki làm"> Chưa đki làm</label>
        `;
    }

    // Event delegation for delete button
    $('#nhanvienTable').on('click', '.delete-btn', function() {
        $(this).closest('tr').remove();
        saveNhanvienData();
    });

    // Event delegation for checkbox and radio change
    $('#nhanvienTable').on('change', 'input', function() {
        saveNhanvienData();
    });

    // Function to fetch employee data
    function fetchNhanvienData() {
        $.ajax({
            url: '/api/nhanvien',
            method: 'GET',
            success: function(data) {
                console.log('Fetched employee data:', data);
                renderNhanvienTable(data);
            },
            error: function(error) {
                console.error('Lỗi khi lấy dữ liệu nhân viên:', error);
            }
        });
    }

    // Function to render the employee table
    function renderNhanvienTable(data) {
        const $tableBody = $('#nhanvienTable tbody');
        $tableBody.empty();

        data.forEach(function(nhanvien) {
            const newRow = `
                <tr>
                    <td>${nhanvien.name}</td>
                    <td><input type="checkbox" ${nhanvien.desk ? 'checked' : ''}></td>
                    <td>${generateOptionsWithData('gone', nhanvien.roles.gone)}</td>
                    <td>${generateOptionsWithData('gum', nhanvien.roles.gum)}</td>
                    <td>${generateOptionsWithData('hns', nhanvien.roles.hns)}</td>
                    <td>${generateOptionsWithData('am', nhanvien.roles.am)}</td>
                    <td>${generateOptionsWithData('ngai1', nhanvien.roles.ngai1)}</td>
                    <td>${generateOptionsWithData('ngai2', nhanvien.roles.ngai2)}</td>
                    <td>${generateOptionsWithData('chd', nhanvien.roles.chd)}</td>
                    <td>${generateOptionsWithData('rrlm', nhanvien.roles.rrlm)}</td>
                    <td>${generateRegistrationOptionsWithData(nhanvien.registration)}</td>
                    <td><button class="btn delete-btn">Xóa</button></td>
                </tr>
            `;
            $tableBody.append(newRow);
        });
    }

    function generateOptionsWithData(role, data) {
        return `
            <label><input type="checkbox" name="${role}-flow" ${data.includes('flow') ? 'checked' : ''}> Flow</label><br>
            <label><input type="checkbox" name="${role}-dien" ${data.includes('dien') ? 'checked' : ''}> Diễn</label><br>
            <label><input type="checkbox" name="${role}-dj" ${data.includes('dj') ? 'checked' : ''}> DJ</label>
        `;
    }

    function generateRegistrationOptionsWithData(registration) {
        return `
            <label><input type="radio" name="registration" value="Đã đki làm" ${registration === 'Đã đki làm' ? 'checked' : ''}> Đã đki làm</label><br>
            <label><input type="radio" name="registration" value="Chưa đki làm" ${registration === 'Chưa đki làm' ? 'checked' : ''}> Chưa đki làm</label>
        `;
    }

    function getRoleStatus($td) {
        return {
            flow: $td.find('input[name$="-flow"]').is(':checked'),
            dien: $td.find('input[name$="-dien"]').is(':checked'),
            dj: $td.find('input[name$="-dj"]').is(':checked')
        };
    }

    function saveNhanvienData() {
        const nhanvienData = [];
        $('#nhanvienTable tbody tr').each(function() {
            const $row = $(this);
            const nhanvien = {
                name: $row.find('td:eq(0)').text(),
                desk: $row.find('td:eq(1) input').is(':checked'),
                roles: {
                    gone: getRoleStatus($row.find('td:eq(2)')),
                    gum: getRoleStatus($row.find('td:eq(3)')),
                    hns: getRoleStatus($row.find('td:eq(4)')),
                    am: getRoleStatus($row.find('td:eq(5)')),
                    ngai1: getRoleStatus($row.find('td:eq(6)')),
                    ngai2: getRoleStatus($row.find('td:eq(7)')),
                    chd: getRoleStatus($row.find('td:eq(8)')),
                    rrlm: getRoleStatus($row.find('td:eq(9)'))
                },
                registration: $row.find('td:eq(10) input:checked').val()
            };
            nhanvienData.push(nhanvien);
        });

        console.log('Saving employee data:', nhanvienData);

        $.ajax({
            url: '/api/nhanvien',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ nhanviens: nhanvienData }),
            success: function(response) {
                console.log('Nhân viên data saved successfully:', response);
            },
            error: function(error) {
                console.error('Lỗi khi lưu dữ liệu nhân viên:', error);
            }
        });
    }
});
