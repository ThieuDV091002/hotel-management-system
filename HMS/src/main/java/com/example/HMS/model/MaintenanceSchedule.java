package com.example.HMS.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "Maintenance_Schedule")
public class MaintenanceSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Integer id;

    @ManyToOne(optional = true)
    @JoinColumn(name = "asset_id", referencedColumnName = "asset_id", nullable = true)
    private Asset asset;

    @ManyToOne(optional = true)
    @JoinColumn(name = "room_id", nullable = true)
    private Room room;

    @Column(name = "scheduled_date")
    private LocalDateTime scheduledDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ScheduleStatus status;

    @ManyToMany
    @JoinTable(
            name = "maintenance_schedule_employees",
            joinColumns = @JoinColumn(name = "schedule_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    private Set<Employee> employees = new HashSet<>();
}
