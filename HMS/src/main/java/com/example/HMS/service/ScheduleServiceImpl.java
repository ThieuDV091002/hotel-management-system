package com.example.HMS.service;

import com.example.HMS.dto.EmployeeSchedule;
import com.example.HMS.dto.ScheduleRequest;
import com.example.HMS.dto.ScheduleResponse;
import com.example.HMS.dto.WeeklyScheduleResponse;
import com.example.HMS.model.Employee;
import com.example.HMS.model.WorkSchedule;
import com.example.HMS.repository.EmployeeRepository;
import com.example.HMS.repository.WorkScheduleRepository;
import com.google.ortools.sat.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {
    private final EmployeeRepository employeeRepository;
    private final WorkScheduleRepository workScheduleRepository;

    private static final String[] SHIFTS = {"morning", "afternoon", "night", "rest"};
    private static final String[] POSITIONS = {"receptionist", "housekeeping", "maintenance", "waiter", "chef", "security", "pos_service"};

    private static final Map<String, Map<String, Integer>> MIN_REQUIREMENTS = new HashMap<>();

    static {
        MIN_REQUIREMENTS.put("receptionist", Map.of("morning", 8, "afternoon", 10, "night", 7));
        MIN_REQUIREMENTS.put("housekeeping", Map.of("morning", 25, "afternoon", 15, "night", 10));
        MIN_REQUIREMENTS.put("maintenance", Map.of("morning", 5, "afternoon", 5, "night", 5));
        MIN_REQUIREMENTS.put("waiter", Map.of("morning", 10, "afternoon", 15, "night", 15));
        MIN_REQUIREMENTS.put("chef", Map.of("morning", 8, "afternoon", 12, "night", 10));
        MIN_REQUIREMENTS.put("security", Map.of("morning", 5, "afternoon", 5, "night", 5));
        MIN_REQUIREMENTS.put("pos_service", Map.of("morning", 5, "afternoon", 8, "night", 5));
    }

    @Override
    public List<ScheduleResponse> createSchedule(ScheduleRequest request) {
        List<Employee> employees = employeeRepository.findByPositionInAndIsActiveTrue(Arrays.asList(POSITIONS));
        if (employees.isEmpty()) {
            throw new RuntimeException("Không có nhân viên nào phù hợp trong cơ sở dữ liệu");
        }

        LocalDate startDate = request.getStartDate();
        LocalDate endDate = startDate.plusDays(6);
        List<LocalDate> days = startDate.datesUntil(endDate.plusDays(1)).collect(Collectors.toList());
        if (days.isEmpty()) {
            throw new RuntimeException("Khoảng thời gian không hợp lệ");
        }

        Map<String, Long> positionCounts = employees.stream()
                .collect(Collectors.groupingBy(Employee::getPosition, Collectors.counting()));
        System.out.println("Số lượng nhân viên theo vai trò:");
        positionCounts.forEach((position, count) -> System.out.println(position + ": " + count));

        CpModel model = new CpModel();
        Map<String, Map<LocalDate, Map<Long, BoolVar[]>>> shiftVars = new HashMap<>();

        for (String position : POSITIONS) {
            shiftVars.put(position, new HashMap<>());
            for (LocalDate date : days) {
                shiftVars.get(position).put(date, new HashMap<>());
                for (Employee emp : employees) {
                    if (emp.getPosition().equals(position)) {
                        BoolVar[] vars = new BoolVar[SHIFTS.length];
                        for (int s = 0; s < SHIFTS.length; s++) {
                            vars[s] = model.newBoolVar(String.format("shift_%d_%s_%s_%s", emp.getId(), date, position, SHIFTS[s]));
                        }
                        shiftVars.get(position).get(date).put(emp.getId(), vars);
                    }
                }
            }
        }

        for (Employee emp : employees) {
            for (LocalDate date : days) {
                BoolVar[] vars = shiftVars.get(emp.getPosition()).get(date).get(emp.getId());
                model.addExactlyOne(vars);
            }
        }

        for (String position : POSITIONS) {
            for (LocalDate date : days) {
                for (String shift : Arrays.copyOfRange(SHIFTS, 0, 3)) {
                    List<BoolVar> roleShiftVars = new ArrayList<>();
                    for (Employee emp : employees) {
                        if (emp.getPosition().equals(position)) {
                            int shiftIdx = Arrays.asList(SHIFTS).indexOf(shift);
                            roleShiftVars.add(shiftVars.get(position).get(date).get(emp.getId())[shiftIdx]);
                        }
                    }
                    int minReq = MIN_REQUIREMENTS.get(position).getOrDefault(shift, 0);
                    System.out.println("Vị trí: " + position + ", Ngày: " + date + ", Ca: " + shift +
                            ", Yêu cầu tối thiểu: " + minReq + ", Số nhân viên khả dụng: " + roleShiftVars.size());
                    if (!roleShiftVars.isEmpty()) {
                        LinearExpr sum = LinearExpr.sum(roleShiftVars.toArray(new BoolVar[0]));
                        model.addLinearConstraint(sum, minReq, Long.MAX_VALUE);
                    }
                }
            }
        }

        for (Employee emp : employees) {
            List<BoolVar> restVars = new ArrayList<>();
            for (LocalDate date : days) {
                int restIdx = Arrays.asList(SHIFTS).indexOf("rest");
                restVars.add(shiftVars.get(emp.getPosition()).get(date).get(emp.getId())[restIdx]);
            }
            if (!restVars.isEmpty()) {
                LinearExpr sum = LinearExpr.sum(restVars.toArray(new BoolVar[0]));
                model.addLinearConstraint(sum, 0, 2);
            }
        }

        CpSolver solver = new CpSolver();
        CpSolverStatus status = solver.solve(model);
        if (status == CpSolverStatus.OPTIMAL || status == CpSolverStatus.FEASIBLE) {
            List<WorkSchedule> schedules = new ArrayList<>();
            try {
                List<WorkSchedule> existingSchedules = workScheduleRepository.findByDateBetween(startDate, endDate);
                if (!existingSchedules.isEmpty()) {
                    System.out.println("Cảnh báo: Đã tồn tại " + existingSchedules.size() + " lịch trong khoảng thời gian này.");
                }

                workScheduleRepository.deleteByDateBetween(startDate, endDate);

                for (Employee emp : employees) {
                    for (LocalDate date : days) {
                        BoolVar[] vars = shiftVars.get(emp.getPosition()).get(date).get(emp.getId());
                        for (int s = 0; s < SHIFTS.length; s++) {
                            if (solver.value(vars[s]) == 1) {
                                String shift = SHIFTS[s];
                                WorkSchedule schedule = new WorkSchedule();
                                schedule.setEmployee(emp);
                                schedule.setDate(date);
                                schedule.setShift(shift);
                                schedules.add(schedule);
                                break;
                            }
                        }
                    }
                }

                workScheduleRepository.saveAll(schedules);
            } catch (ObjectOptimisticLockingFailureException e) {
                throw new RuntimeException("Xung đột dữ liệu: Lịch làm việc đã bị thay đổi bởi giao dịch khác. Vui lòng thử lại.", e);
            }

            return schedulesToResponse(schedules);
        } else {
            throw new RuntimeException("Không tìm được lịch làm việc khả thi");
        }
    }

    @Override
    public Page<WeeklyScheduleResponse> getScheduleForWeek(LocalDate startDate, String fullName, Pageable pageable) {
        LocalDate endDate = startDate.plusDays(6);

        Page<Employee> employeePage;
        if (fullName != null && !fullName.isEmpty()) {
            employeePage = employeeRepository.findByFullNameContaining(fullName, pageable);
        } else {
            employeePage = employeeRepository.findAll(pageable);
        }

        List<Employee> employees = employeePage.getContent();
        if (employees.isEmpty()) {
            WeeklyScheduleResponse response = new WeeklyScheduleResponse();
            response.setStartDate(startDate);
            response.setEmployees(new ArrayList<>());
            return new PageImpl<>(Collections.singletonList(response), pageable, 0);
        }

        List<WorkSchedule> schedules = workScheduleRepository.findByEmployeeInAndDateBetween(
                employees, startDate, endDate);

        Map<Employee, List<WorkSchedule>> schedulesByEmployee = schedules.stream()
                .collect(Collectors.groupingBy(WorkSchedule::getEmployee));

        List<EmployeeSchedule> employeeSchedules = employees.stream()
                .map(emp -> {
                    EmployeeSchedule es = new EmployeeSchedule();
                    es.setEmployeeId(emp.getId());
                    es.setFullName(emp.getFullName());
                    es.setPosition(emp.getPosition());
                    List<ScheduleResponse> workSchedules = schedulesByEmployee.getOrDefault(emp, new ArrayList<>())
                            .stream()
                            .map(this::scheduleToResponse)
                            .collect(Collectors.toList());
                    es.setWorkSchedules(workSchedules);
                    return es;
                })
                .collect(Collectors.toList());

        WeeklyScheduleResponse response = new WeeklyScheduleResponse();
        response.setStartDate(startDate);
        response.setEmployees(employeeSchedules);

        return new PageImpl<>(Collections.singletonList(response), pageable, employeePage.getTotalElements());
    }

    @Override
    public Page<ScheduleResponse> getEmployeeSchedule(Employee employee, LocalDate startDate, Pageable pageable) {
        Page<WorkSchedule> schedules;
        if (startDate != null) {
            LocalDate endDate = startDate.plusDays(6);
            schedules = workScheduleRepository.findByEmployeeAndDateBetween(employee, startDate, endDate, pageable);
        } else {
            schedules = workScheduleRepository.findByEmployee(employee, pageable);
        }
        return schedules.map(this::scheduleToResponse);
    }

    @Override
    public List<ScheduleResponse> getMaintenanceEmployeesAtTime(LocalDateTime time) {
        LocalDate date = time.toLocalDate();
        LocalTime localTime = time.toLocalTime();

        String shift = determineShift(localTime);
        if (shift == null) {
            return new ArrayList<>();
        }

        if (shift.equals("night") && localTime.isBefore(LocalTime.of(6, 0))) {
            date = date.plusDays(1);
        }

        List<Employee> maintenanceEmployees = employeeRepository.findByPosition("maintenance");
        if (maintenanceEmployees.isEmpty()) {
            return new ArrayList<>();
        }

        List<WorkSchedule> schedules = workScheduleRepository.findByEmployeeInAndDate(maintenanceEmployees, date)
                .stream()
                .filter(s -> s.getShift().equals(shift))
                .collect(Collectors.toList());

        return schedulesToResponse(schedules);
    }

    @Override
    public ScheduleResponse updateShift(Long scheduleId, String newShift) {
        if (!Arrays.asList(SHIFTS).contains(newShift)) {
            throw new IllegalArgumentException("Ca làm việc không hợp lệ: " + newShift);
        }

        WorkSchedule schedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch làm việc với ID: " + scheduleId));

        Employee employee = schedule.getEmployee();
        LocalDate date = schedule.getDate();
        List<WorkSchedule> existingSchedules = workScheduleRepository.findByEmployeeAndDate(employee, date);
        if (existingSchedules.size() > 1) {
            throw new RuntimeException("Nhân viên đã được xếp lịch trong ngày này");
        }

        String position = employee.getPosition();
        String oldShift = schedule.getShift();
        if (!"rest".equals(newShift)) {
            List<WorkSchedule> schedulesInShift = workScheduleRepository.findByDateAndShiftAndEmployeePosition(date, newShift, position);
            int minReq = MIN_REQUIREMENTS.get(position).getOrDefault(newShift, 0);
            if (schedulesInShift.size() < minReq) {
                if (!"rest".equals(oldShift) && Arrays.asList(SHIFTS).indexOf(oldShift) < 3) {
                    List<WorkSchedule> oldShiftSchedules = workScheduleRepository.findByDateAndShiftAndEmployeePosition(date, oldShift, position);
                    if (oldShiftSchedules.size() - 1 < MIN_REQUIREMENTS.get(position).getOrDefault(oldShift, 0)) {
                        throw new RuntimeException("Thay đổi ca sẽ vi phạm yêu cầu tối thiểu cho ca " + oldShift);
                    }
                }
            }
        }

        try {
            schedule.setShift(newShift);
            workScheduleRepository.save(schedule);
            return scheduleToResponse(schedule);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new RuntimeException("Xung đột dữ liệu: Lịch làm việc đã bị thay đổi bởi giao dịch khác. Vui lòng thử lại.", e);
        }
    }

    @Override
    public void deleteSchedule(Long scheduleId) {
        WorkSchedule schedule = workScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch làm việc với ID: " + scheduleId));

        String position = schedule.getEmployee().getPosition();
        String shift = schedule.getShift();
        LocalDate date = schedule.getDate();
        if (!"rest".equals(shift)) {
            List<WorkSchedule> schedulesInShift = workScheduleRepository.findByDateAndShiftAndEmployeePosition(date, shift, position);
            int minReq = MIN_REQUIREMENTS.get(position).getOrDefault(shift, 0);
            if (schedulesInShift.size() <= minReq) {
                throw new RuntimeException("Xóa lịch sẽ vi phạm yêu cầu tối thiểu cho ca " + shift);
            }
        }

        try {
            workScheduleRepository.delete(schedule);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new RuntimeException("Xung đột dữ liệu: Lịch làm việc đã bị thay đổi bởi giao dịch khác. Vui lòng thử lại.", e);
        }
    }

    @Override
    public ScheduleResponse createSingleSchedule(ScheduleRequest request) {
        Long employeeId = request.getEmployeeId();
        LocalDate date = request.getScheduleDate();
        String shift = request.getShift();

        if (!Arrays.asList(SHIFTS).contains(shift)) {
            throw new IllegalArgumentException("Ca làm việc không hợp lệ: " + shift);
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với ID: " + employeeId));

        List<WorkSchedule> existingSchedules = workScheduleRepository.findByEmployeeAndDate(employee, date);
        if (!existingSchedules.isEmpty()) {
            throw new RuntimeException("Nhân viên đã được xếp lịch trong ngày này");
        }

        String position = employee.getPosition();
        if (!"rest".equals(shift)) {
            List<WorkSchedule> schedulesInShift = workScheduleRepository.findByDateAndShiftAndEmployeePosition(date, shift, position);
            int minReq = MIN_REQUIREMENTS.get(position).getOrDefault(shift, 0);
            if (schedulesInShift.size() < minReq) {
                System.out.println("Cảnh báo: Số lượng nhân viên trong ca " + shift + " thấp hơn yêu cầu tối thiểu");
            }
        }

        try {
            WorkSchedule schedule = new WorkSchedule();
            schedule.setEmployee(employee);
            schedule.setDate(date);
            schedule.setShift(shift);
            workScheduleRepository.save(schedule);
            return scheduleToResponse(schedule);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new RuntimeException("Xung đột dữ liệu: Lịch làm việc đã bị thay đổi bởi giao dịch khác. Vui lòng thử lại.", e);
        }
    }

    private String determineShift(LocalTime time) {
        LocalTime morningStart = LocalTime.of(7, 0);
        LocalTime afternoonStart = LocalTime.of(15, 0);
        LocalTime nightStart = LocalTime.of(23, 0);

        if (time.isAfter(morningStart) && time.isBefore(afternoonStart)) {
            return "morning";
        } else if (time.isAfter(afternoonStart) && time.isBefore(nightStart)) {
            return "afternoon";
        } else if (time.isAfter(nightStart) || time.isBefore(morningStart)) {
            return "night";
        }
        return null;
    }

    private List<ScheduleResponse> schedulesToResponse(List<WorkSchedule> schedules) {
        return schedules.stream().map(this::scheduleToResponse).collect(Collectors.toList());
    }

    private ScheduleResponse scheduleToResponse(WorkSchedule s) {
        ScheduleResponse response = new ScheduleResponse();
        Employee emp = s.getEmployee();
        response.setId(s.getId());
        response.setEmployeeId(emp.getId());
        response.setFullName(emp.getFullName());
        response.setPosition(emp.getPosition());
        response.setDate(s.getDate());
        response.setShift(s.getShift());
        return response;
    }
}
