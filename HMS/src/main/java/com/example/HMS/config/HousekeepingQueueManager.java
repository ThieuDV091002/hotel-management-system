package com.example.HMS.config;

import com.example.HMS.model.Employee;
import com.example.HMS.model.WorkSchedule;
import com.example.HMS.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class HousekeepingQueueManager {
    private final WorkScheduleRepository workScheduleRepository;
    private final Deque<Long> housekeepingQueue = new ArrayDeque<>();
    private LocalDateTime lastQueueUpdate;

    private LocalDateTime getShiftStartTime(LocalDateTime currentTime) {
        LocalTime[] shiftTimes = {
                LocalTime.of(7, 0),   // 7:00 AM
                LocalTime.of(15, 0),  // 3:00 PM
                LocalTime.of(23, 0)   // 11:00 PM
        };
        LocalTime currentTimeOfDay = currentTime.toLocalTime();
        LocalDate currentDate = currentTime.toLocalDate();
        for (LocalTime shiftTime : shiftTimes) {
            if (currentTimeOfDay.isBefore(shiftTime)) {
                return LocalDateTime.of(currentDate, shiftTime);
            }
        }
        return LocalDateTime.of(currentDate.plusDays(1), shiftTimes[0]);
    }

    private String getShiftName(LocalDateTime shiftStart) {
        LocalTime startTime = shiftStart.toLocalTime();
        if (startTime.equals(LocalTime.of(7, 0))) return "MORNING";
        if (startTime.equals(LocalTime.of(15, 0))) return "AFTERNOON";
        return "NIGHT";
    }

    public synchronized void updateQueue(LocalDateTime currentTime) {
        LocalDateTime shiftStart = getShiftStartTime(currentTime);
        if (lastQueueUpdate != null && lastQueueUpdate.equals(shiftStart)) {
            return;
        }

        housekeepingQueue.clear();
        String shiftName = getShiftName(shiftStart);
        List<WorkSchedule> schedules = workScheduleRepository.findByDateAndShift(currentTime.toLocalDate(), shiftName);
        schedules.stream()
                .filter(ws -> {
                    Employee emp = ws.getEmployee();
                    return emp.getPosition().equals("housekeeping") && emp.isActive();
                })
                .map(ws -> ws.getEmployee().getId())
                .forEach(housekeepingQueue::add);

        lastQueueUpdate = shiftStart;
        log.info("Updated queue at {} with employees: {}", shiftStart, housekeepingQueue);
    }

    public synchronized Long assignEmployee() {
        if (housekeepingQueue.isEmpty()) {
            return null;
        }
        Long employeeId = housekeepingQueue.pollFirst();
        housekeepingQueue.addLast(employeeId);
        return employeeId;
    }
}
